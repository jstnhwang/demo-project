"use client";

import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-6">Welcome to Our Platform</h1>

      <p className="text-xl max-w-xl text-center mb-10">
        This is the platform&apos;s landing page. Explore our features and
        services.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        {!loading && !user ? (
          <>
            <Link href="/sign-in" className="btn btn-primary">
              Sign In
            </Link>
            <Link href="/sign-up" className="btn btn-outline">
              Create Account
            </Link>
          </>
        ) : (
          <Link href="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
