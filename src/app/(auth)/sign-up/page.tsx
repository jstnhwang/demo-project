"use client";

import { AuthFormContainer } from "@/components/ui/auth-form-container";
import { SocialAuthButtons } from "@/components/ui/social-auth-buttons";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simple validation
      if (!name || !email || !password) {
        toast({
          title: "Error",
          variant: "error",
          description: "All fields are required",
        });
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: "Error",
          variant: "error",
          description: "Passwords do not match",
        });
        setLoading(false);
        return;
      }

      // In a real app, you would send data to your API here
      // Simulate successful sign-up
      toast({
        title: "Success",
        description: "Account created successfully!",
      });

      // Redirect to login
      router.push("/");
    } catch (error) {
      console.error("Sign up error:", error);
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
      title="Create an Account"
      subtitle="Join us and start your journey today!"
    >
      <form onSubmit={handleSignUp} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            className="input input-md w-full"
            placeholder="John Doe"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

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

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
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
            placeholder="••••••••"
            value={confirmPassword}
            className="input input-md w-full"
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-md w-full"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <div className="divider text-sm">OR</div>

        <SocialAuthButtons type="signup" />

        <div className="text-center mt-6">
          <p className="text-sm">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-primary underline-offset-4 hover:underline font-medium"
            >
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </AuthFormContainer>
  );
}
