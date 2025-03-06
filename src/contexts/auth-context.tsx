// src/contexts/auth-context.tsx
"use client";

import { authLogEvents } from "@/lib/auth-logger";
import { supabase } from "@/lib/supabase-client";
import { AuthResponse, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

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
  signInWithMagicLink: (
    email: string,
    options?: {
      isSignUp?: boolean;
      metadata?: Record<string, unknown>;
    }
  ) => Promise<AuthResponse>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
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
      authLogEvents.sessionChanged(event);
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
    authLogEvents.attemptSignUp("email/password", { email, fullName });

    try {
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
        authLogEvents.signUpSuccess("email/password", response.data.user.id);

        await supabase.from("profiles").upsert({
          user_id: response.data.user.id,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        });
      } else if (response.error) {
        authLogEvents.signUpError("email/password", response.error);
      }

      return response;
    } catch (error) {
      authLogEvents.signUpError("email/password", error);
      throw error;
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        // You can add session settings here like 'persist' for remember me
      },
    });

    return response;
  };

  // Sign in with magic link
  const signInWithMagicLink = async (
    email: string,
    options?: {
      isSignUp?: boolean;
      metadata?: Record<string, unknown>;
    }
  ) => {
    const flowType = options?.isSignUp ? "sign-up" : "sign-in";
    authLogEvents.attemptSignIn(`magic-link (${flowType})`, {
      email,
      metadata: options?.metadata,
    });

    try {
      const response = await supabase.auth.signInWithOtp({
        email,
        options: {
          // Allow user creation for sign-up, prevent for sign-in
          shouldCreateUser: options?.isSignUp ?? false,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: options?.metadata || undefined,
        },
      });

      if (response.error) {
        authLogEvents.magicLinkError(response.error);
      } else {
        authLogEvents.magicLinkSent(email);
      }

      return response;
    } catch (error) {
      authLogEvents.magicLinkError(error);
      throw error;
    }
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

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithMagicLink,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
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
