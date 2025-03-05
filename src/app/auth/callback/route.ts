import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const isSignUp = requestUrl.searchParams.get("signup") === "true";

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const user = data.user;

      // Check if this is a new sign-up or if the user has no profile
      if (isSignUp || user.app_metadata?.isSignUp) {
        // Check if profile already exists
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select()
          .eq("user_id", user.id)
          .single();

        // If no profile exists, create one
        if (profileError || !profileData) {
          // Get user metadata (or an empty object if none)
          const metadata = user.user_metadata || {};

          await supabase.from("profiles").upsert({
            user_id: user.id,
            full_name: metadata.full_name || "",
            updated_at: new Date().toISOString(),
          });
        }
      }
    }
  }

  // Redirect to the dashboard page
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
