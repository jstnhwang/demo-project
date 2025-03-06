"use client";

import { AuthFormContainer } from "@/components/ui/auth-form-container";
import { FormField } from "@/components/ui/form-field";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { handleAuthError } from "@/lib/auth-utils";
import { passwordCriteria } from "@/lib/schemas/auth-schema";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { updatePasswordWithToken, isPasswordRecovery, user, loading } =
    useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Redirect if not in password recovery mode
  useEffect(() => {
    if (!loading && !isPasswordRecovery && user) {
      toast({
        title: "Invalid Access",
        variant: "error",
        description: "You can only access this page during password recovery",
      });
      router.push("/dashboard");
    } else if (!loading && !isPasswordRecovery && !user) {
      toast({
        title: "Invalid Access",
        variant: "error",
        description: "Please request a password reset link first",
      });
      router.push("/forgot-password");
    }
  }, [isPasswordRecovery, user, loading, router, toast]);

  const validatePassword = (): boolean => {
    if (!password) {
      setError("Password is required");
      return false;
    }

    // Check all password criteria
    const criteriaChecks = [
      {
        check: passwordCriteria.hasUppercase(password),
        message: "Password must contain at least one uppercase letter",
      },
      {
        check: passwordCriteria.hasLowercase(password),
        message: "Password must contain at least one lowercase letter",
      },
      {
        check: passwordCriteria.hasNumber(password),
        message: "Password must contain at least one number",
      },
      {
        check: passwordCriteria.hasSpecialChar(password),
        message: "Password must contain at least one special character",
      },
      {
        check: passwordCriteria.hasMinLength(password),
        message: "Password must be at least 8 characters long",
      },
    ];

    for (const { check, message } of criteriaChecks) {
      if (!check) {
        setError(message);
        return false;
      }
    }

    setError("");
    return true;
  };

  const validateConfirmPassword = (): boolean => {
    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match");
      return false;
    }

    setConfirmError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword() || !validateConfirmPassword()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await updatePasswordWithToken(password);

      if (response.error) {
        const { message } = handleAuthError(response.error, "signin");
        toast({
          title: "Password Reset Failed",
          variant: "error",
          description: message,
        });
      } else {
        setIsSuccess(true);
        toast({
          title: "Password Reset Successful",
          description: "Your password has been updated successfully.",
        });

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      }
    } catch (error: unknown) {
      console.error("Password update error:", error);
      const { message } = handleAuthError(error, "signin");

      toast({
        title: "Password Reset Failed",
        variant: "error",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Display loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // If we're not in password recovery mode and not showing success, show an error
  if (!isPasswordRecovery && !isSuccess && !loading) {
    return (
      <AuthFormContainer
        title="Invalid Request"
        subtitle="You need to use a valid password reset link"
      >
        <div className="bg-error/10 rounded-lg p-6 my-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-error"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-2">Invalid Access</h3>

          <div className="mb-4">
            <p>You need to request a password reset first.</p>
          </div>

          <button
            onClick={() => router.push("/forgot-password")}
            className="btn btn-primary btn-sm"
          >
            Go to Password Reset
          </button>
        </div>
      </AuthFormContainer>
    );
  }

  return (
    <AuthFormContainer
      title="Create New Password"
      subtitle="Enter your new password below"
    >
      {isSuccess ? (
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

          <h3 className="text-xl font-semibold mb-2">
            Password Reset Successful
          </h3>

          <div className="mb-4">
            <p>Your password has been updated successfully.</p>
            <p className="mt-1">
              You will be redirected to the dashboard shortly.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <FormField
              id="password"
              label="New Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              error={error}
              onBlur={validatePassword}
              autoComplete="new-password"
            />
            <PasswordStrengthIndicator password={password} />
          </div>

          <FormField
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            error={confirmError}
            onBlur={validateConfirmPassword}
            autoComplete="new-password"
          />

          <button
            type="submit"
            className="btn btn-primary btn-md w-full"
            disabled={isLoading}
          >
            {isLoading ? "Please wait..." : "Reset Password"}
          </button>
        </form>
      )}
    </AuthFormContainer>
  );
}
