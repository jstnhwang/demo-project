// app/(auth)/sign-in/page.tsx
"use client";

import { AuthFormContainer } from "@/components/ui/auth-form-container";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useState } from "react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMagicLink, setIsMagicLink] = useState(false);

  const { signIn, signInWithGoogle, signInWithGitHub, signInWithMagicLink } =
    useAuth();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isMagicLink) {
        await signInWithMagicLink(email);
        toast({
          title: "Magic Link Sent",
          description: "Check your email for the login link",
        });
        return;
      }

      // Regular email/password sign in
      await signIn(email, password, rememberMe);

      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast({
        title: "Error",
        variant: "error",
        description: error.message || "Invalid credentials. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        variant: "error",
        description: "Failed to sign in with Google",
      });
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      await signInWithGitHub();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        variant: "error",
        description: "Failed to sign in with GitHub",
      });
    }
  };

  return (
    <AuthFormContainer
      title="Welcome Back!"
      subtitle="We are so excited to see you again!"
    >
      <form onSubmit={handleSignIn} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input input-md w-full"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        {!isMagicLink && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <a
                href="#"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              className="input input-md w-full"
              onChange={e => setPassword(e.target.value)}
              required={!isMagicLink}
            />
          </div>
        )}

        {isMagicLink && (
          <div>
            <p className="text-sm text-content-50">
              We&apos;ll email you a magic link for password-free sign in.
            </p>
            <button
              type="button"
              onClick={() => setIsMagicLink(false)}
              className="text-sm text-primary underline-offset-4 hover:underline mt-2"
            >
              Use password instead
            </button>
          </div>
        )}

        {!isMagicLink && (
          <>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember-me"
                className="checkbox checkbox-sm checkbox-primary"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
              />
              <label
                htmlFor="remember-me"
                className="text-sm cursor-pointer select-none"
              >
                Remember me
              </label>
            </div>

            <button
              type="button"
              onClick={() => setIsMagicLink(true)}
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Use magic link instead
            </button>
          </>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-md w-full"
          disabled={loading}
        >
          {loading
            ? "Please wait..."
            : isMagicLink
            ? "Send Magic Link"
            : "Sign In"}
        </button>

        <div className="divider text-sm">OR</div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="btn btn-outline w-full bg-white text-black border-[#e5e5e5] hover:bg-gray-100"
          >
            <svg
              aria-label="Google logo"
              width="16"
              height="16"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              className="mr-2"
            >
              <g>
                <path d="m0 0H512V512H0" fill="#fff"></path>
                <path
                  fill="#34a853"
                  d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
                ></path>
                <path
                  fill="#4285f4"
                  d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
                ></path>
                <path
                  fill="#fbbc02"
                  d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
                ></path>
                <path
                  fill="#ea4335"
                  d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
                ></path>
              </g>
            </svg>
            Login with Google
          </button>

          <button
            type="button"
            onClick={handleGitHubSignIn}
            className="btn btn-outline w-full bg-black text-white border-black hover:bg-gray-900"
          >
            <svg
              aria-label="GitHub logo"
              width="16"
              height="16"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="mr-2"
            >
              <path
                fill="white"
                d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"
              ></path>
            </svg>
            Login with GitHub
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="text-primary underline-offset-4 hover:underline font-medium"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </form>
    </AuthFormContainer>
  );
}
