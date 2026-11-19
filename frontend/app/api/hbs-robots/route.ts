import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const robotsText = `# Hind Building Solutions (HBS) Robots Directives
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /admin-login
Disallow: /api/

Sitemap: https://hindbuilding.hindustanprojects.in/sitemap.xml
`;

  return new NextResponse(robotsText, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
