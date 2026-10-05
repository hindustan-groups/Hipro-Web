import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const hostHeader = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "").split(":")[0].toLowerCase();
  const nextHostname = req.nextUrl.hostname?.toLowerCase() || "";

  // Root domain protection: explicitly preserve normal behavior for www.hindustanprojects.in and hindustanprojects.in
  const isHbsSubdomain =
    nextHostname === "hindbuilding.hindustanprojects.in" ||
    hostHeader === "hindbuilding.hindustanprojects.in";

  if (!isHbsSubdomain) {
    return NextResponse.next();
  }

  const { pathname, search } = req.nextUrl;

  // Admin and API protection: NEVER route /admin, /admin-login, /api, or static assets through HBS hostname routing
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/admin-login") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // If a request on the subdomain directly uses /hbs or /hbs/*, redirect to the clean subdomain path
  // to prevent /hbs appearing in the browser URL on the subdomain
  if (pathname === "/hbs") {
    return NextResponse.redirect(new URL(`/${search}`, req.url), 307);
  }
  if (pathname.startsWith("/hbs/")) {
    const cleanPath = pathname.replace(/^\/hbs/, "");
    return NextResponse.redirect(new URL(`${cleanPath}${search}`, req.url), 307);
  }

  // Internal rewrite: map root and public pages on the subdomain to the internal /hbs application
  // e.g.:
  // /         -> /hbs
  // /about    -> /hbs/about
  // /services -> /hbs/services
  // /projects -> /hbs/projects
  // /contact  -> /hbs/contact
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
