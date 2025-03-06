"use client";

import { AuthFormContainer } from "@/components/ui/auth-form-container";
import { FormField } from "@/components/ui/form-field";
import { MagicLinkConfirmation } from "@/components/ui/magic-link-confirmation";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";
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
    errors,
    validateEmailField,
    validatePasswordField,
    validateNameField,
    handleSubmit,
    handleSocialAuth,
    toggleAuthMethod,
  } = useAuthForm({ mode: "signup" });

  return (
    <AuthFormContainer
      title="Create an Account"
      subtitle="Join us and start your journey today!"
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
            <>
              <FormField
                id="name"
                label="Full Name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                required
                error={errors.name}
                onBlur={validateNameField}
                autoComplete="name"
              />

              <div className="space-y-2">
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
                  autoComplete="new-password"
                />
                <PasswordStrengthIndicator password={password} />
              </div>
            </>
          )}

          {useMagicLink && (
            <FormField
              id="name"
              label="Full Name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="John Doe"
              required
              error={errors.name}
              onBlur={validateNameField}
              autoComplete="name"
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
              : "Sign Up"}
          </button>

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
      )}
    </AuthFormContainer>
  );
}
