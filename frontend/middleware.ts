import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

  // 2. Edge Authentication Guard: Enforce session cookie presence for /admin and /admin/*
  // Denies unauthenticated access at the edge before Server Components or SSR render.
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  if (isAdminRoute) {
    const adminSession = req.cookies.get("admin_session")?.value;
    if (!adminSession || adminSession.trim() === "") {
      const loginUrl = new URL("/admin-login", req.url);
      const returnTo = `${pathname}${search}`;
      if (returnTo !== "/admin") {
        loginUrl.searchParams.set("returnTo", returnTo);
      }
      return NextResponse.redirect(loginUrl, 307);
    }
    // Cookie present: let request proceed to Server Component & backend validation
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
