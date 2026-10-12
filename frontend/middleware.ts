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
    hostHeader === "empanelment.hindustanprojects.in";

  if (!isHbsSubdomain && !isEmpanelmentSubdomain) {
    return NextResponse.next();
  }

  const { pathname, search } = req.nextUrl;

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
