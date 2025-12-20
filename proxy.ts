// middleware.ts
import { auth } from "@/auth"; // your NextAuth auth config export (from auth.ts)
import { NextResponse } from "next/server";

const protectedRoutes = ["/admin", "/admin/:path*","/dashboard", "/dashboard/:path*",]; 

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;

  const isProtected = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route.replace(":path*", ""))
  );

  if (isProtected) {
    if (!session) {
      // Redirect unauthenticated to home or login
      return NextResponse.redirect(new URL("/", nextUrl));
    }

    if (session.user?.role !== "admin") {
      // Redirect non-admins
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*","/dashboard/:path*"], // only run on admin routes
};