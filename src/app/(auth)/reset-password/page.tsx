"use client";

import { AuthFormContainer } from "@/components/ui/auth-form-container";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [isValidResetFlow, setIsValidResetFlow] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the flow parameter from the URL
  const flow = searchParams.get("flow");
  const isRecoveryFlow = flow === "recovery";

  // Check if this is a valid password reset flow
  useEffect(() => {
    const validateResetFlow = async () => {
      try {
        // Check if we have an active session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        // We need both a valid session AND the recovery flow parameter
        if (data.session && isRecoveryFlow) {
          setIsValidResetFlow(true);
        } else if (data.session && !isRecoveryFlow) {
          // User is logged in but not in a recovery flow - redirect to dashboard
          router.push("/dashboard");
        } else {
          // No session - redirect to sign in
          router.push("/sign-in");
        }
      } catch (error) {
        console.error("Session validation error:", error);
        router.push("/sign-in");
      } finally {
        setCheckingAuth(false);
      }
    };

    validateResetFlow();
  }, [router, isRecoveryFlow]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate passwords
      if (password !== confirmPassword) {
        toast({
          title: "Error",
          variant: "error",
          description: "Passwords do not match",
        });
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        toast({
          title: "Error",
          variant: "error",
          description: "Password must be at least 6 characters",
        });
        setLoading(false);
        return;
      }

      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      // Show success message
      setResetComplete(true);

      toast({
        title: "Success",
        description: "Your password has been reset successfully",
      });

      // Redirect to dashboard after a delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast({
        title: "Error",
        variant: "error",
        description:
          error.message || "Failed to reset password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (checkingAuth) {
    return (
      <AuthFormContainer
        title="Preparing Reset Password"
        subtitle="Please wait while we prepare your password reset..."
      >
        <div className="flex justify-center my-8">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </AuthFormContainer>
    );
  }

  // If not a valid reset flow, show an error
  if (!isValidResetFlow && !resetComplete) {
    return (
      <AuthFormContainer
        title="Invalid Reset Request"
        subtitle="This doesn't appear to be a valid password reset request"
      >
        <div className="space-y-6">
          <div className="bg-error/10 p-4 rounded-lg">
            <p className="text-sm text-error-content">
              Your password reset link may have expired or is invalid. Please
              request a new password reset link.
            </p>
          </div>
          <button
            onClick={() => router.push("/forgot-password")}
            className="btn btn-primary w-full"
          >
            Request New Reset Link
          </button>
        </div>
      </AuthFormContainer>
    );
  }

  return (
    <AuthFormContainer
      title="Set New Password"
      subtitle="Enter your new password below"
    >
      {resetComplete ? (
        <div className="space-y-6">
          <div className="bg-success/10 p-4 rounded-lg">
            <p className="text-sm text-success-content">
              Your password has been reset successfully! You will be redirected
              to the dashboard shortly.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              New Password
            </label>
            <input
              id="password"
              type="password"
              className="input input-md w-full"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="input input-md w-full"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-md w-full"
            disabled={loading}
          >
            {loading ? "Please wait..." : "Reset Password"}
          </button>
        </form>
      )}
    </AuthFormContainer>
  );
}
