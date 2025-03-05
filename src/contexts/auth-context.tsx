"use client";

import { supabase } from "@/lib/supabase-client";
import { AuthError, AuthResponse, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type ResetPasswordResponse = {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  data: {} | null;
  error: AuthError | null;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<AuthResponse>;
  signIn: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<AuthResponse>;
  signInWithMagicLink: (email: string) => Promise<AuthResponse>;
  signUpWithMagicLink: (
    email: string,
    fullName?: string
  ) => Promise<AuthResponse>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<ResetPasswordResponse>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    fetchSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);

      // Redirect if signed in or out
      if (event === "SIGNED_IN" && session) {
        router.push("/dashboard");
      } else if (event === "SIGNED_OUT") {
        router.push("/sign-in");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Sign up with email and password
  const signUp = async (email: string, password: string, fullName: string) => {
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    // Create profile record
    if (response.data?.user) {
      await supabase.from("profiles").upsert({
        user_id: response.data.user.id,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      });
    }

    return response;
  };

  // Sign in with email and password
  const signIn = async (
    email: string,
    password: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    rememberMe = false
  ) => {
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {},
    });

    return response;
  };

  // Sign in with magic link (for existing users)
  const signInWithMagicLink = async (email: string) => {
    return await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  // Sign up with magic link (for new users)
  const signUpWithMagicLink = async (email: string, fullName?: string) => {
    // For passwordless sign-up, we use signInWithOtp but store metadata
    // in localStorage to use when creating the profile later
    if (fullName) {
      // Store the user's name temporarily in localStorage
      localStorage.setItem("pendingSignUpName", fullName);
    }

    // Use signInWithOtp for passwordless flow
    return await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?signup=true`,
        // Add metadata to identify this as a sign-up, not just a sign-in
        data: {
          isSignUp: true,
          full_name: fullName || "",
        },
      },
    });
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  // Sign in with GitHub
  const signInWithGitHub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (
    email: string
  ): Promise<ResetPasswordResponse> => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithMagicLink,
    signUpWithMagicLink,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
