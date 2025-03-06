"use client";

import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
  handleAuthError,
  isStrongPassword,
  isValidEmail,
} from "@/lib/auth-utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type AuthMode = "signin" | "signup";

interface UseAuthFormProps {
  mode: AuthMode;
  redirectAfterSuccess?: string;
}

export interface FormErrors {
  email: string;
  password: string;
  name: string;
}

export function useAuthForm({ mode, redirectAfterSuccess }: UseAuthFormProps) {
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Form errors state
  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    password: "",
    name: "",
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Auth context and toast
  const {
    signIn,
    signUp,
    signInWithGoogle,
    signInWithGitHub,
    signInWithMagicLink,
  } = useAuth();

  const { toast } = useToast();

  const handleAuthSuccess = () => {
    if (redirectAfterSuccess) {
      router.push(redirectAfterSuccess);
    }
  };

  // Field-specific validation functions
  const validateEmailField = (): boolean => {
    if (!email.trim()) {
      setErrors(prev => ({ ...prev, email: "This field is required" }));
      return false;
    }

    if (!isValidEmail(email)) {
      setErrors(prev => ({
        ...prev,
        email: "Please enter a valid email address",
      }));
      return false;
    }

    setErrors(prev => ({ ...prev, email: "" }));
    return true;
  };

  const validatePasswordField = (): boolean => {
    if (!password) {
      setErrors(prev => ({ ...prev, password: "This field is required" }));
      return false;
    }

    if (mode === "signup" && !isStrongPassword(password)) {
      // For password, we don't show specific requirements here since they're shown in the indicator
      setErrors(prev => ({
        ...prev,
        password: "Please ensure your password meets all the requirements",
      }));
      return false;
    }

    setErrors(prev => ({ ...prev, password: "" }));
    return true;
  };

  const validateNameField = (): boolean => {
    if (mode === "signup" && !name.trim()) {
      setErrors(prev => ({ ...prev, name: "This field is required" }));
      return false;
    }

    if (mode === "signup" && name.trim().length < 2) {
      setErrors(prev => ({
        ...prev,
        name: "Name must be at least 2 characters",
      }));
      return false;
    }

    setErrors(prev => ({ ...prev, name: "" }));
    return true;
  };

  // Validate all fields
  const validateAllFields = (): boolean => {
    const emailValid = validateEmailField();
    const passwordValid = !useMagicLink ? validatePasswordField() : true;
    const nameValid = mode === "signup" ? validateNameField() : true;

    return emailValid && passwordValid && nameValid;
  };

  // Handle sign in/up with email/password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (useMagicLink) {
      await handleMagicLink();
      return;
    }

    // Validate all fields
    if (!validateAllFields()) {
      return;
    }

    setIsLoading(true);

    try {
      // Sign In Condition
      if (mode === "signin") {
        const response = await signIn(email, password);

        if (response && response.error) {
          const { type, message } = handleAuthError(response.error, mode);
          toast({
            title:
              type === "invalid_credentials"
                ? "Authentication Failed"
                : "Error",
            variant: "error",
            description: message,
          });
        } else if (!response?.data?.user) {
          toast({
            title: "Authentication Failed",
            variant: "error",
            description: "Unable to sign in. Please check your credentials.",
          });
        } else {
          toast({
            title: "Welcome Back",
            description: "Logged in successfully!",
          });
          handleAuthSuccess();
        }
      } else {
        // Sign Up Condition
        const response = await signUp(email, password, name);

        if (response && response.error) {
          const { type, message } = handleAuthError(response.error, mode);
          toast({
            title:
              type === "invalid_credentials" ? "Registration Failed" : "Error",
            variant: "error",
            description: message,
          });
        } else {
          toast({
            title: "Account Created",
            description: "Please check your email to confirm your account.",
          });
          handleAuthSuccess();
        }
      }
    } catch (error: unknown) {
      console.error(`${mode} error:`, error);

      const { type, message } = handleAuthError(error, mode);

      toast({
        title:
          type === "invalid_credentials" ? "Authentication Failed" : "Error",
        variant: "error",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle magic link for both sign-in and sign-up
  const handleMagicLink = async () => {
    if (!validateEmailField()) return;

    if (mode === "signup" && !validateNameField()) return;

    setMagicLinkLoading(true);

    try {
      // Log the attempt for debugging
      console.info(`Sending magic link for ${mode}:`, {
        email,
        name: name || undefined,
      });

      // Different behavior based on mode
      if (mode === "signup") {
        // For signup, include user metadata and ensure user creation is allowed
        const metadata = name ? { full_name: name } : undefined;

        const response = await signInWithMagicLink(email, {
          isSignUp: true,
          metadata,
        });

        // Store name temporarily for potential use after redirect
        if (name && typeof window !== "undefined") {
          localStorage.setItem("pendingSignUpName", name);
        }

        // Check for error
        if (response.error) throw response.error;
      } else {
        // For sign-in, don't create new users
        const response = await signInWithMagicLink(email, { isSignUp: false });

        // Check for error
        if (response.error) throw response.error;
      }

      // Log successful send
      console.info(`Magic link email successfully sent to ${email}`);

      setMagicLinkSent(true);

      toast({
        title: "Magic Link Sent",
        description: `Check your email inbox for the ${
          mode === "signin" ? "sign-in" : "sign-up"
        } link`,
      });
    } catch (error: unknown) {
      // Enhanced error logging
      console.error("Magic link error:", {
        email,
        mode,
        error:
          error instanceof Error
            ? { message: error.message, name: error.name, stack: error.stack }
            : error,
      });

      const { message } = handleAuthError(error, "magic_link");

      toast({
        title: "Magic Link Failed",
        variant: "error",
        description: message,
      });
    } finally {
      setMagicLinkLoading(false);
    }
  };

  // Handle social authentication
  const handleSocialAuth = async (provider: "google" | "github") => {
    try {
      if (provider === "google") {
        await signInWithGoogle();
        handleAuthSuccess();
      } else {
        await signInWithGitHub();
        handleAuthSuccess();
      }
    } catch (error: unknown) {
      console.error(`${provider} auth error:`, error);

      const { message } = handleAuthError(error, "social");

      toast({
        title: "Authentication Failed",
        variant: "error",
        description: message,
      });
    }
  };

  // Toggle between password and magic link
  const toggleAuthMethod = async (): Promise<void> => {
    setUseMagicLink(!useMagicLink);
    setMagicLinkSent(false);
    setErrors({ email: "", password: "", name: "" });
    return Promise.resolve();
  };

  return {
    // State
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
    errors,

    // Validation methods
    validateEmailField,
    validatePasswordField,
    validateNameField,

    // Form handling methods
    handleSubmit,
    handleSocialAuth,
    toggleAuthMethod,
    setMagicLinkSent,
  };
}
