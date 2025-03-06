"use client";

import { AuthFormContainer } from "@/components/ui/auth-form-container";
import { FormField } from "@/components/ui/form-field";
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
    errors,
    validateEmailField,
    validatePasswordField,
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
          <FormField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            error={errors.email}
            onBlur={validateEmailField}
            autoComplete="email"
          />

          {!useMagicLink && (
            <FormField
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              error={errors.password}
              onBlur={validatePasswordField}
              autoComplete="current-password"
              rightElement={
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              }
            />
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
