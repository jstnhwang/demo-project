"use client";

import { AuthFormContainer } from "@/components/ui/auth-form-container";
import { SocialAuthButtons } from "@/components/ui/social-auth-buttons";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DEMO_USER = {
  id: "demo-user-id",
  email: "admin@example.com",
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simple validation
      if (email === "admin@example.com" && password === "password") {
        // Store demo user in localStorage for persistence
        localStorage.setItem("user", JSON.stringify(DEMO_USER));

        toast({
          title: "Success",
          description: "Logged in successfully!",
        });

        router.push("/dashboard");
      } else {
        toast({
          title: "Error",
          variant: "error",
          description: "Invalid credentials. Try admin@example.com / password",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        variant: "error",
        description: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormContainer
      title="Welcome Back!"
      subtitle="We are so excited to see you again!"
    >
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input input-md w-full"
            placeholder="admin@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <a
              href="#"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            className="input input-md w-full"
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="remember-me"
            className="checkbox checkbox-sm checkbox-primary"
            checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
          />
          <label
            htmlFor="remember-me"
            className="text-sm cursor-pointer select-none"
          >
            Remember me
          </label>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-md w-full"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="divider text-sm">OR</div>

        <SocialAuthButtons type="login" />

        <div className="text-center mt-6">
          <p className="text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="text-primary underline-offset-4 hover:underline font-medium"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </form>
    </AuthFormContainer>
  );
}
