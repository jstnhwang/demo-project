// app/(auth)/sign-up/page.tsx

"use client";

import { AuthFormContainer } from "@/components/ui/auth-form-container";
import { useAuth } from "@/contexts/auth-context";
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
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);

  const { signUp, signInWithGoogle, signInWithGitHub, signInWithMagicLink } =
    useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
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

      // Sign up with Supabase
      await signUp(email, password, name);

      toast({
        title: "Success",
        description:
          "Account created successfully! Please check your email to confirm your account.",
      });

      // Optionally redirect to login page or verification page
      router.push("/");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast({
        title: "Error",
        variant: "error",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLinkSignUp = async () => {
    if (!email) {
      toast({
        title: "Error",
        variant: "error",
        description: "Please enter your email address.",
      });
      return;
    }

    setMagicLinkLoading(true);
    try {
      await signInWithMagicLink(email);
      toast({
        title: "Magic Link Sent",
        description: "Check your email for the sign-up link",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Magic link error:", error);
      toast({
        title: "Error",
        variant: "error",
        description: error.message || "Failed to send magic link",
      });
    } finally {
      setMagicLinkLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        variant: "error",
        description: "Failed to sign up with Google",
      });
    }
  };

  const handleGitHubSignUp = async () => {
    try {
      await signInWithGitHub();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        variant: "error",
        description: "Failed to sign up with GitHub",
      });
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
          {loading ? "Please wait..." : "Sign Up"}
        </button>

        <div className="divider text-sm">OR</div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="btn btn-outline w-full bg-white text-black border-[#e5e5e5] hover:bg-gray-100"
          >
            <svg
              aria-label="Google logo"
              width="16"
              height="16"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              className="mr-2"
            >
              <g>
                <path d="m0 0H512V512H0" fill="#fff"></path>
                <path
                  fill="#34a853"
                  d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
                ></path>
                <path
                  fill="#4285f4"
                  d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
                ></path>
                <path
                  fill="#fbbc02"
                  d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
                ></path>
                <path
                  fill="#ea4335"
                  d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
                ></path>
              </g>
            </svg>
            Sign up with Google
          </button>

          <button
            type="button"
            onClick={handleGitHubSignUp}
            className="btn btn-outline w-full bg-black text-white border-black hover:bg-gray-900"
          >
            <svg
              aria-label="GitHub logo"
              width="16"
              height="16"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="mr-2"
            >
              <path
                fill="white"
                d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"
              ></path>
            </svg>
            Sign up with GitHub
          </button>

          <button
            type="button"
            onClick={handleMagicLinkSignUp}
            disabled={magicLinkLoading}
            className="btn bg-white text-black border-[#e5e5e5] w-full"
          >
            <svg
              aria-label="Email icon"
              width="16"
              height="16"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="mr-2"
            >
              <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2"
                fill="none"
                stroke="black"
              >
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </g>
            </svg>
            {magicLinkLoading ? "Sending..." : "Sign up with Email"}
          </button>
        </div>

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
