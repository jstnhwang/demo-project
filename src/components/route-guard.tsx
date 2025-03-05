"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

// Define public routes that don't require authentication
const publicRoutes = ["/sign-in", "/sign-up", "/auth/callback"];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip checking during initial load
    if (loading) return;

    const isPublicRoute = publicRoutes.includes(pathname);

    // User is not logged in and route isn't public
    if (!user && !isPublicRoute && pathname !== "/") {
      router.push("/sign-in");
    }

    // User is logged in but trying to access auth pages
    if (user && isPublicRoute) {
      router.push("/dashboard");
    }
  }, [user, loading, pathname, router]);

  // Show loading indicator during auth check
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return <>{children}</>;
}
