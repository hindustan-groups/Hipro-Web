/**
 * databaseSafety.ts — Local Seed Script Loopback Host Enforcement & Target Confirmation
 *
 * Purpose:
 *   Prevent standalone seed/migration scripts and runtime seed handlers from writing
 *   to a remote database when executed in a non-production environment (development, test, CI, or unset).
 *
 * Rules:
 *   1. If NODE_ENV is not explicitly "production", DATABASE_URL must resolve to an
 *      unambiguous loopback host (localhost, 127.0.0.1, ::1, [::1]).
 *   2. In non-production environments, ALLOW_REMOTE_SEED and ALLOW_PRODUCTION_SEED
 *      have NO effect. They cannot bypass the loopback enforcement.
 *   3. In production (NODE_ENV=production), remote seeding is disabled by default.
 *      To authorize remote seeding, ALL of the following must be provided:
 *        a) ALLOW_REMOTE_SEED=true (or ALLOW_PRODUCTION_SEED=true)
 *        b) TARGET_DB_HOST_CONFIRMATION matching the parsed hostname of DATABASE_URL
 *        c) TARGET_DB_NAME_CONFIRMATION matching the parsed database name of DATABASE_URL
 *   4. Sentinel strings (e.g. "<missing-database-url>", "<unparseable-url>") can NEVER
 *      be used as confirmations or authorized as valid targets.
 *   5. Connection strings and credentials are NEVER logged. Only parsed hostname
 *      and database name appear in error diagnostics.
 *
 * Usage:
 *   Import and call assertLocalDatabase() at the top of any seed script or before
 *   any seed write operation.
 */

/** Safe loopback hostnames (case-insensitive). */
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export interface DatabaseDestination {
  hostname: string;
  databaseName: string;
}

/**
 * Extracts and normalises the hostname and database name from a connection URL
 * without logging the full connection string (which may contain credentials).
 *
 * Supports:
 *   postgresql://user:pass@host:port/dbname?query
 *   postgres://user:pass@host:port/dbname?query
 *   prisma+postgres://...  (Prisma Accelerate — treated as remote)
 */
export function parseDatabaseDestination(rawUrl: string | undefined): DatabaseDestination {
  if (!rawUrl || rawUrl.trim() === "") {
    return {
      hostname: "<missing-database-url>",
      databaseName: "<missing-database-name>",
    };
  }

  try {
    const trimmed = rawUrl.trim();

    // Prisma Accelerate URLs use prisma+postgres:// scheme — always remote.
    if (trimmed.startsWith("prisma+postgres://") || trimmed.startsWith("prisma+postgresql://")) {
      return {
        hostname: "<prisma-accelerate-remote-host>",
        databaseName: "<prisma-accelerate-database>",
      };
    }

    // Only postgresql:// and postgres:// are valid database connection schemes.
    if (!trimmed.startsWith("postgresql://") && !trimmed.startsWith("postgres://")) {
      return {
        hostname: "<unsupported-scheme>",
        databaseName: "<unsupported-scheme>",
      };
    }

    // Detect hostless PostgreSQL connection URIs (e.g. postgresql:///dbname or postgres:///dbname)
    const hostlessMatch = trimmed.match(/^postgres(?:ql)?:\/\/\/(.*)$/);
    if (hostlessMatch) {
      const rawPath = hostlessMatch[1].split("?")[0];
      const rawDbName = (rawPath.split("/")[0] || "").split("?")[0];
      const databaseName = decodeURIComponent(rawDbName).trim().toLowerCase();
      return {
        hostname: "<missing-hostname>",
        databaseName: databaseName || "<missing-database-name>",
      };
    }

    // Normalise to a parseable scheme for the WHATWG URL constructor.
    const normalised = trimmed
      .replace(/^postgresql:\/\//, "https://")
      .replace(/^postgres:\/\//, "https://");

    const parsed = new URL(normalised);
    const hostname = parsed.hostname.toLowerCase();
    const rawPath = parsed.pathname.replace(/^\//, "");
    const rawDbName = (rawPath.split("/")[0] || "").split("?")[0];
    const databaseName = decodeURIComponent(rawDbName).trim().toLowerCase();

    return {
      hostname: hostname || "<missing-hostname>",
      databaseName: databaseName || "<missing-database-name>",
    };
  } catch {
    return {
      hostname: "<unparseable-url>",
      databaseName: "<unparseable-url>",
    };
  }
}

/**
 * Helper to extract only the hostname (for backward compatibility).
 */
export function extractHostname(rawUrl: string | undefined): string {
  return parseDatabaseDestination(rawUrl).hostname;
}

/**
 * Asserts that the current DATABASE_URL points to a local loopback host when
 * running outside of an explicit production environment.
 *
 * In production, requires explicit bypass flags and destination confirmation
 * (TARGET_DB_HOST_CONFIRMATION and TARGET_DB_NAME_CONFIRMATION).
 *
 * Throws a fatal Error if any check fails.
 *
 * @throws {Error} If a remote database host is detected without valid confirmation.
 */
export function assertLocalDatabase(): void {
  const env = process.env.NODE_ENV ?? "";
  const dest = parseDatabaseDestination(process.env.DATABASE_URL);

  // In production, evaluate the remote seed bypass with destination confirmation.
  if (env === "production") {
    const isBypassRequested =
      process.env.ALLOW_REMOTE_SEED === "true" ||
      process.env.ALLOW_PRODUCTION_SEED === "true";

    if (isBypassRequested) {
      const confirmedHost = process.env.TARGET_DB_HOST_CONFIRMATION?.trim().toLowerCase();
      const confirmedName = process.env.TARGET_DB_NAME_CONFIRMATION?.trim().toLowerCase();

      if (!confirmedHost || !confirmedName) {
        throw new Error(
          `[FATAL SAFETY ABORT] Remote database seed blocked in production.\n` +
          `  Reason: Seeding a remote database requires explicit target destination confirmation.\n` +
          `  Missing: ${!confirmedHost ? "TARGET_DB_HOST_CONFIRMATION " : ""}${!confirmedName ? "TARGET_DB_NAME_CONFIRMATION" : ""}\n` +
          `  Set both environment variables to match the intended database target before running remote seed.`
        );
      }

      // Sentinel values cannot be confirmed or authorized.
      if (
        dest.hostname.startsWith("<") ||
        dest.databaseName.startsWith("<") ||
        confirmedHost.startsWith("<") ||
        confirmedName.startsWith("<")
      ) {
        throw new Error(
          `[FATAL SAFETY ABORT] Invalid database destination in production seed!\n` +
          `  DATABASE_URL format is invalid or unsupported: host="${dest.hostname}", db="${dest.databaseName}".\n` +
          `  Sentinel values cannot be confirmed. Remote seeding aborted.`
        );
      }

      if (dest.hostname !== confirmedHost || dest.databaseName !== confirmedName) {
        throw new Error(
          `[FATAL SAFETY ABORT] Target database confirmation mismatch in production seed!\n` +
          `  Target Host Confirmation:    expected "${confirmedHost}", parsed "${dest.hostname}"\n` +
          `  Target DB Name Confirmation: expected "${confirmedName}", parsed "${dest.databaseName}"\n` +
          `  Connection string is NOT logged to protect credentials. Remote seeding aborted.`
        );
      }

      // Explicitly confirmed production target
      return;
    }

    // In production, if no bypass flag is set, allow loopback hosts (e.g. local container prod tests)
    // but reject remote hosts by default.
    if (!LOOPBACK_HOSTS.has(dest.hostname)) {
      throw new Error(
        `[FATAL SAFETY ABORT] Remote database write/seed blocked in production.\n` +
        `  Reason: Remote database access is disabled by default in production.\n` +
        `  To authorize seeding against an explicit remote database, configure:\n` +
        `    ALLOW_REMOTE_SEED=true\n` +
        `    TARGET_DB_HOST_CONFIRMATION=<expected-hostname>\n` +
        `    TARGET_DB_NAME_CONFIRMATION=<expected-database-name>`
      );
    }

    return;
  }

  // Non-production modes (development, test, staging, CI, or unset):
  // Neither ALLOW_REMOTE_SEED nor ALLOW_PRODUCTION_SEED can bypass the loopback check.
  if (!LOOPBACK_HOSTS.has(dest.hostname)) {
    throw new Error(
      `[FATAL SAFETY ABORT] Seed script blocked.\n` +
      `  Reason: DATABASE_URL resolves to a non-local host ("${dest.hostname}") ` +
      `while NODE_ENV is "${env || "unset"}".\n` +
      `  This guard prevents accidental writes to a remote or production database ` +
      `from local seed scripts.\n\n` +
      `  To run this seed locally:\n` +
      `    Set DATABASE_URL to a loopback address, e.g.:\n` +
      `      DATABASE_URL=postgresql://postgres:password@localhost:5432/hipro_dev\n\n` +
      `  To run this seed in production (Render / CI deploy step only):\n` +
      `    Set NODE_ENV=production, ALLOW_REMOTE_SEED=true, ` +
      `TARGET_DB_HOST_CONFIRMATION, and TARGET_DB_NAME_CONFIRMATION.\n` +
      `    Do NOT set ALLOW_REMOTE_SEED=true in your local .env file.`
    );
  }
}
