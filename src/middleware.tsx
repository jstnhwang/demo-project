import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired & still has a refresh token
  await supabase.auth.getSession();

  return res;
}

// This ensures middleware runs for all paths
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
