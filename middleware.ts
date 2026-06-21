import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const apexHost = "7labs.org";
const wwwHost = `www.${apexHost}`;

export function middleware(request: NextRequest) {
  if (request.headers.get("host")?.toLowerCase() !== wwwHost) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.protocol = "https";
  url.host = apexHost;
  return NextResponse.redirect(url, 308);
}

export const config = {
  // Skip static assets, image optimizer, and metadata files so the host check
  // only runs for real navigations instead of every Worker request.
  matcher: "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|svg|ico|woff2)$).*)"
};
