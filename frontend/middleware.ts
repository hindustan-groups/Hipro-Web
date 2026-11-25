import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Admin Gateway Secret Key (Configurable via environment variable or default secure key)
const ADMIN_SECRET_KEY = (process.env.ADMIN_SECRET_KEY || "hp-admin-gateway-key-2026").trim();

function isValidAdminSecretKey(candidate: string | null | undefined): boolean {
  if (!candidate) return false;
  return candidate.trim().toLowerCase() === ADMIN_SECRET_KEY.toLowerCase();
}

export function middleware(req: NextRequest) {
  const hostHeader = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "").split(":")[0].toLowerCase();
  const nextHostname = req.nextUrl.hostname?.toLowerCase() || "";

  // Root domain protection: explicitly preserve normal behavior for www.hindustanprojects.in and hindustanprojects.in
  const isHbsSubdomain =
    nextHostname === "hindbuilding.hindustanprojects.in" ||
    hostHeader === "hindbuilding.hindustanprojects.in";

  const isEmpanelmentSubdomain =
    nextHostname === "empanelment.hindustanprojects.in" ||
    hostHeader === "empanelment.hindustanprojects.in" ||
    nextHostname === "vendor.hindustanprojects.in" ||
    hostHeader === "vendor.hindustanprojects.in" ||
    nextHostname === "vender.hindustanprojects.in" ||
    hostHeader === "vender.hindustanprojects.in";

  const { pathname, search } = req.nextUrl;

  // 1. Subdomain Isolation: NEVER expose /admin or /admin-login on tenant/vendor subdomains.
  // Redirect immediately to the canonical primary domain.
  if (isHbsSubdomain || isEmpanelmentSubdomain) {
    if (
      pathname === "/admin" ||
      pathname.startsWith("/admin/") ||
      pathname === "/admin-login" ||
      pathname.startsWith("/admin-login/")
    ) {
      const primaryOrigin = process.env.NEXT_PUBLIC_SITE_URL || "https://www.hindustanprojects.in";
      return NextResponse.redirect(new URL(`${pathname}${search}`, primaryOrigin), 307);
    }
  }

  // 2. Stealth Admin Gateway Secret Key Verification:
  // Check if candidate secret key is provided via query parameter (?key=..., ?secret=...) or path slug (/admin-login/KEY, /admin/KEY)
  const querySecretKey =
    req.nextUrl.searchParams.get("key") ||
    req.nextUrl.searchParams.get("secret") ||
    req.nextUrl.searchParams.get("gateway_key") ||
    req.nextUrl.searchParams.get("token");

  const isKeyInQuery = isValidAdminSecretKey(querySecretKey);

  let isKeyInPath = false;
  if (pathname.startsWith("/admin-login/")) {
    const slug = pathname.replace(/^\/admin-login\//, "").split("/")[0];
    if (isValidAdminSecretKey(slug)) isKeyInPath = true;
  } else if (pathname.startsWith("/admin/")) {
    const slug = pathname.replace(/^\/admin\//, "").split("/")[0];
    if (isValidAdminSecretKey(slug)) isKeyInPath = true;
  }

  // If valid secret key is provided (query or path), grant persistent access cookie and redirect to clean /admin-login
  if (isKeyInQuery || isKeyInPath) {
    const targetUrl = new URL("/admin-login", req.url);
    const returnTo = req.nextUrl.searchParams.get("returnTo");
    if (returnTo) {
      targetUrl.searchParams.set("returnTo", returnTo);
    }
    const response = NextResponse.redirect(targetUrl, 307);
    response.cookies.set({
      name: "admin_portal_access",
      value: "granted",
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days persistent gatekeeper access
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  }

  // 3. Admin Access Authorization State:
  const hasPortalAccessCookie = req.cookies.get("admin_portal_access")?.value === "granted";
  const hasAdminSession = Boolean(req.cookies.get("admin_session")?.value?.trim());
  const isAuthorizedAdminVisitor = hasPortalAccessCookie || hasAdminSession;

  // 4. Guard /admin-login:
  // If unauthorized (no secret key cookie and not logged in), hide the page completely and redirect to Home (/)
  const isAdminLoginRoute = pathname === "/admin-login" || pathname.startsWith("/admin-login/");
  if (isAdminLoginRoute) {
    if (!isAuthorizedAdminVisitor) {
      return NextResponse.redirect(new URL("/", req.url), 307);
    }
    return NextResponse.next();
  }

  // 5. Guard /admin and /admin/*:
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  if (isAdminRoute) {
    // If visitor has no secret key cookie and no admin session, bounce to Home (/)
    if (!isAuthorizedAdminVisitor) {
      return NextResponse.redirect(new URL("/", req.url), 307);
    }

    // Visitor has unlocked the gate via secret key, but is not yet authenticated with admin_session:
    if (!hasAdminSession) {
      const loginUrl = new URL("/admin-login", req.url);
      const returnTo = `${pathname}${search}`;
      if (returnTo !== "/admin") {
        loginUrl.searchParams.set("returnTo", returnTo);
      }
      return NextResponse.redirect(loginUrl, 307);
    }

    // Both portal access and admin session present: proceed to Server Component & backend validation
    return NextResponse.next();
  }

  if (!isHbsSubdomain && !isEmpanelmentSubdomain) {
    const isPrimaryDomain =
      hostHeader === "www.hindustanprojects.in" ||
      hostHeader === "hindustanprojects.in" ||
      nextHostname === "www.hindustanprojects.in" ||
      nextHostname === "hindustanprojects.in";

    if (isPrimaryDomain) {
      if (pathname === "/hbs") {
        return NextResponse.redirect(new URL(`/${search}`, "https://hindbuilding.hindustanprojects.in"), 301);
      }
      if (pathname.startsWith("/hbs/")) {
        const cleanPath = pathname.replace(/^\/hbs/, "");
        return NextResponse.redirect(new URL(`${cleanPath}${search}`, "https://hindbuilding.hindustanprojects.in"), 301);
      }
    }

    return NextResponse.next();
  }

  // HBS dedicated sitemap and robots on subdomain
  if (isHbsSubdomain) {
    if (pathname === "/sitemap.xml") {
      return NextResponse.rewrite(new URL("/api/hbs-sitemap", req.url));
    }
    if (pathname === "/robots.txt") {
      return NextResponse.rewrite(new URL("/api/hbs-robots", req.url));
    }
  }

  // Admin and API protection: NEVER route /admin, /admin-login, /api, or static assets through subdomain hostname routing
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/admin-login") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Empanelment subdomain handling
  if (isEmpanelmentSubdomain) {
    if (pathname === "/empanelment") {
      return NextResponse.redirect(new URL(`/${search}`, req.url), 307);
    }
    if (pathname.startsWith("/empanelment/")) {
      const cleanPath = pathname.replace(/^\/empanelment/, "");
      return NextResponse.redirect(new URL(`${cleanPath}${search}`, req.url), 307);
    }

    const targetPath = `/empanelment${pathname === "/" ? "" : pathname}`;
    const rewriteUrl = new URL(`${targetPath}${search}`, req.url);
    return NextResponse.rewrite(rewriteUrl);
  }

  // HBS subdomain handling
  if (pathname === "/hbs") {
    return NextResponse.redirect(new URL(`/${search}`, req.url), 307);
  }
  if (pathname.startsWith("/hbs/")) {
    const cleanPath = pathname.replace(/^\/hbs/, "");
    return NextResponse.redirect(new URL(`${cleanPath}${search}`, req.url), 307);
  }

  const targetPath = `/hbs${pathname === "/" ? "" : pathname}`;
  const rewriteUrl = new URL(`${targetPath}${search}`, req.url);

  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
