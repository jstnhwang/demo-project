import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);

    return NextResponse.redirect(
      new URL(`/reset-password?recovery=true`, request.url)
    );
  }

  // Redirect to the dashboard page
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
