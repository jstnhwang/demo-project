"use client";

import { AuthFormContainer } from "@/components/ui/auth-form-container";
import { MagicLinkConfirmation } from "@/components/ui/magic-link-confirmation";
import { SocialAuthButton } from "@/components/ui/social-auth-button";
import { useAuthForm } from "@/hooks/use-auth-form";
import Link from "next/link";

export default function SignIn() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    useMagicLink,
    magicLinkLoading,
    magicLinkSent,
    setMagicLinkSent,
    handleSubmit,
    handleSocialAuth,
    toggleAuthMethod,
  } = useAuthForm({ mode: "signin" });

  return (
    <AuthFormContainer
      title="Welcome Back!"
      subtitle="We are so excited to see you again!"
    >
      {useMagicLink && magicLinkSent ? (
        <MagicLinkConfirmation
          email={email}
          onResendClick={async () => {
            setMagicLinkSent(false);
            await handleSubmit(
              new Event("submit") as unknown as React.FormEvent
            );
          }}
          resendDisabled={magicLinkLoading}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input input-md w-full"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {!useMagicLink && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                className="input input-md w-full"
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-md w-full"
            disabled={isLoading || magicLinkLoading}
          >
            {isLoading || magicLinkLoading
              ? "Please wait..."
              : useMagicLink
              ? "Send Magic Link"
              : "Sign In"}
          </button>

          {useMagicLink && (
            <button
              type="button"
              onClick={toggleAuthMethod}
              className="btn btn-link btn-sm w-full"
            >
              Use password instead
            </button>
          )}

          <div className="divider text-sm">OR</div>

          <div className="space-y-3">
            <SocialAuthButton
              provider="google"
              onClick={() => handleSocialAuth("google")}
              label="Login with Google"
            />

            <SocialAuthButton
              provider="github"
              onClick={() => handleSocialAuth("github")}
              label="Login with GitHub"
            />

            {!useMagicLink && (
              <SocialAuthButton
                provider="magic-link"
                onClick={toggleAuthMethod}
                label="Login with Email"
              />
            )}
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
      )}
    </AuthFormContainer>
  );
}
