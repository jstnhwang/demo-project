"use client";

import { AuthFormContainer } from "@/components/ui/auth-form-container";
import { FormField } from "@/components/ui/form-field";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { handleAuthError, isValidEmail } from "@/lib/auth-utils";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPassword(email);

      if (response.error) {
        const { message } = handleAuthError(response.error, "magic_link");
        setError(message);
        toast({
          title: "Password Reset Failed",
          variant: "error",
          description: message,
        });
      } else {
        setResetEmailSent(true);
        toast({
          title: "Check Your Email",
          description: "We've sent a password reset link to your email",
        });
      }
    } catch (error: unknown) {
      console.error("Password reset error:", error);
      const { message } = handleAuthError(error, "magic_link");

      toast({
        title: "Password Reset Failed",
        variant: "error",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFormContainer
      title="Reset Your Password"
      subtitle="Enter your email to receive a password reset link"
    >
      {resetEmailSent ? (
        <div className="bg-success/10 rounded-lg p-6 my-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-success"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-2">Email Sent</h3>

          <div className="mb-4">
            <p>We&lsquo;ve sent a password reset link to:</p>
            <p className="font-semibold mt-1">{email}</p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-success"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Click the link in your email to reset your password</span>
            </div>

            <p className="text-neutral-content text-xs">
              The link will expire in 24 hours
            </p>

            <div className="divider text-xs text-neutral-content">
              CAN&apos;T FIND THE EMAIL?
            </div>

            <div className="space-y-2 text-sm">
              <p>Check your spam or junk folder</p>

              <button
                onClick={() => setResetEmailSent(false)}
                className="btn btn-sm btn-outline mt-2"
              >
                Try a different email
              </button>
            </div>
          </div>
        </div>
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
            error={error}
            onBlur={validateEmail}
            autoComplete="email"
          />

          <button
            type="submit"
            className="btn btn-primary btn-md w-full"
            disabled={isLoading}
          >
            {isLoading ? "Please wait..." : "Send Reset Link"}
          </button>

          <div className="text-center mt-6">
            <p className="text-sm">
              Remember your password?{" "}
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
