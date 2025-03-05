"use client";

import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push("/sign-in");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Error",
        variant: "error",
        description: "Failed to sign out",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="card bg-base-100 shadow-xl w-full max-w-lg">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold mb-6">Dashboard</h2>

          <div className="bg-base-200 p-6 rounded-lg mb-6">
            <h3 className="text-xl font-semibold mb-4">User Information</h3>
            <div className="space-y-3">
              <p>
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-medium">User ID:</span>{" "}
                <span className="text-xs break-all">{user.id}</span>
              </p>
              <p>
                <span className="font-medium">Last Sign In:</span>{" "}
                {new Date(user.last_sign_in_at || "").toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between mt-4">
            <button onClick={handleSignOut} className="btn btn-error btn-md">
              Sign Out
            </button>
            <button
              onClick={() => router.push("/")}
              className="btn btn-outline btn-md"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
