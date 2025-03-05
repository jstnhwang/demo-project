"use client";

import { AuthFormContainer } from "@/components/ui/auth-form-container";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate email
      if (!email) {
        toast({
          title: "Error",
          variant: "error",
          description: "Please enter your email address",
        });
        setLoading(false);
        return;
      }

      // Request password reset
      const { error } = await resetPassword(email);

      if (error) throw error;

      // Show success state
      setResetSent(true);
      toast({
        title: "Reset Link Sent",
        description: "Check your email for the password reset link",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast({
        title: "Error",
        variant: "error",
        description: error.message || "Failed to send reset link",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormContainer
      title="Reset Your Password"
      subtitle="Enter your email to receive a password reset link"
    >
      {resetSent ? (
        <div className="space-y-6">
          <div className="bg-success/10 p-4 rounded-lg">
            <p className="text-sm text-success-content">
              Reset link sent! Please check your email inbox and click on the
              link to reset your password.
            </p>
          </div>
          <Link href="/sign-in" className="btn btn-primary w-full">
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-6">
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

          <button
            type="submit"
            className="btn btn-primary btn-md w-full"
            disabled={loading}
          >
            {loading ? "Please wait..." : "Send Reset Link"}
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
