import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicPaths = ["/", "/login", "/signup", "/verify-email", "/forgot-password", "/reset-password"]
const protectedPaths = ["/profile", "/dashboard"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  if (isPublicPath && !isProtectedPath) {
    return NextResponse.next()
  }

  const sessionToken = request.cookies.get("better-auth.session_token")?.value

  if (!sessionToken && isProtectedPath) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
