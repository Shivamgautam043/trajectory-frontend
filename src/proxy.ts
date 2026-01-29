// export const runtime = "nodejs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function proxy(request: NextRequest) {

  console.log("middleware run");
  // const token = request.cookies.get("token")?.value;

  // const publicRoutes = ["/login", "/signup", "/auth"];

  // const isPublic = publicRoutes.some((route) =>
  //   request.nextUrl.pathname.startsWith(route),
  // );
  // if (isPublic) return NextResponse.next();
  // if (!token) {
  //   console.log("No token found");
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }
  // try {
  //   jwt.verify(token, process.env.JWT_SECRET!);
  //   return NextResponse.next();
  // } catch (err) {
  //   console.log("ef748d70-172b-422d-89f1-44fe33c5bd1e");
  //   console.log(err);
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }
}

// Run middleware on ALL ROUTES except static assets
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/public).*)"],
};
