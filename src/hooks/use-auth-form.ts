// src/hooks/use-auth-form.ts
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

export function useAuthForm({ mode, redirectAfterSuccess }: UseAuthFormProps) {
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

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

  // Redirect helper
  const handleAuthSuccess = () => {
    if (redirectAfterSuccess) {
      router.push(redirectAfterSuccess);
    }
  };

  // Input validation
  const validateEmail = (): boolean => {
    if (!email) {
      toast({
        title: "Email Required",
        variant: "error",
        description: "Please enter your email address.",
      });
      return false;
    }

    if (!isValidEmail(email)) {
      toast({
        title: "Invalid Email",
        variant: "error",
        description: "Please enter a valid email address.",
      });
      return false;
    }

    return true;
  };

  const validatePassword = (): boolean => {
    if (!password) {
      toast({
        title: "Password Required",
        variant: "error",
        description: "Please enter your password.",
      });
      return false;
    }

    if (mode === "signup" && !isStrongPassword(password)) {
      toast({
        title: "Weak Password",
        variant: "error",
        description:
          "Password must be at least 8 characters and include uppercase, lowercase letters and numbers.",
      });
      return false;
    }

    return true;
  };

  const validateName = (): boolean => {
    if (mode === "signup" && !useMagicLink && !name) {
      toast({
        title: "Name Required",
        variant: "error",
        description: "Please enter your full name.",
      });
      return false;
    }
    return true;
  };

  // Handle sign in/up with email/password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (useMagicLink) {
      await handleMagicLink();
      return;
    }

    // Validate inputs
    if (!validateEmail() || !validatePassword() || !validateName()) {
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
    if (!validateEmail()) return;

    setMagicLinkLoading(true);

    try {
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

      setMagicLinkSent(true);

      toast({
        title: "Magic Link Sent",
        description: `Check your email inbox for the ${
          mode === "signin" ? "sign-in" : "sign-up"
        } link`,
      });
    } catch (error: unknown) {
      console.error("Magic link error:", error);

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

    // Methods
    handleSubmit,
    handleSocialAuth,
    toggleAuthMethod,
    setMagicLinkSent,
  };
}
