import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { createClient } from "@/utils/supabase/server";

export async function middleware(request: NextRequest) {
  // First, update the session (handles token refresh, etc.)
  const response = await updateSession(request);

  // Get the pathname
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Check if user is logged in
    if (!user) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user is admin
    const isAdmin = user.id === process.env.ADMIN_USER_ID;
    if (!isAdmin) {
      // Redirect non-admin users to dashboard or show 403
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Define public routes that don't require authentication
  const publicRoutes = ["/login", "/signup", "/privacy", "/terms", "/contact", "/whats-new"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if this is an API route
  const isApiRoute = pathname.startsWith("/api");

  // For non-public, non-API routes, redirect to login
  if (!isPublicRoute && !isApiRoute && pathname !== "/") {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};