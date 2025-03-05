"use client";

import { AuthFormContainer } from "@/components/ui/auth-form-container";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

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
      // When the user clicks the reset link in their email, Supabase automatically
      // creates a recovery session. We can use this session to update the password.
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

      // Redirect to sign-in page after a delay
      setTimeout(() => {
        router.push("/sign-in");
      }, 3000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast({
        title: "Error",
        variant: "error",
        description:
          error.message ||
          "Failed to reset password. Make sure you're using the link from your email.",
      });
    } finally {
      setLoading(false);
    }
  };

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
              to the sign-in page shortly.
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
