"use client";

import { AuthFormContainer } from "@/components/ui/auth-form-container";
import { MagicLinkConfirmation } from "@/components/ui/magic-link-confirmation";
import { SocialAuthButton } from "@/components/ui/social-auth-button";
import { useAuthForm } from "@/hooks/use-auth-form";
import Link from "next/link";

export default function SignUp() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    isLoading,
    useMagicLink,
    magicLinkLoading,
    magicLinkSent,
    setMagicLinkSent,
    handleSubmit,
    handleSocialAuth,
    toggleAuthMethod,
  } = useAuthForm({ mode: "signup" });

  return (
    <AuthFormContainer
      title="Create an Account"
      subtitle="Join us and start your journey today!"
    >
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
          />
        </div>

        {!useMagicLink && (
          <>
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                className="input input-md w-full"
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                className="input input-md w-full"
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </>
        )}

        {useMagicLink && (
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              className="input input-md w-full"
              placeholder="John Doe"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
        )}

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
          <button
            type="submit"
            className="btn btn-primary btn-md w-full"
            disabled={isLoading || magicLinkLoading}
          >
            {isLoading || magicLinkLoading
              ? "Please wait..."
              : useMagicLink
              ? "Send Magic Link"
              : "Sign Up"}
          </button>
        )}

        {useMagicLink && !magicLinkSent && (
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
            label="Sign up with Google"
          />

          <SocialAuthButton
            provider="github"
            onClick={() => handleSocialAuth("github")}
            label="Sign up with GitHub"
          />

          {!useMagicLink && !magicLinkSent && (
            <SocialAuthButton
              provider="magic-link"
              onClick={toggleAuthMethod}
              label="Sign up with Email"
            />
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-sm">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-primary underline-offset-4 hover:underline font-medium"
            >
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </AuthFormContainer>
  );
}
