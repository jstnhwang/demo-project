// app/(auth)/layout.tsx
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      {/* Image Section (60% on desktop) with glassmorphism */}
      <div className="hidden md:block md:w-3/5 relative overflow-hidden">
        <Image
          src="/assets/image-2.jpg"
          fill
          priority
          className="object-cover scale-110 blur-sm"
          alt="auth-background"
        />
        <div className="absolute inset-0 backdrop-blur-md bg-white/10"></div>
        {/* Content specific to each page would be handled in the page files */}
      </div>

      {/* Form Section (40% on desktop, 100% on mobile) */}
      <div className="w-full md:w-2/5 h-full overflow-y-auto bg-base-100 flex flex-col">
        {children}
      </div>
    </div>
  );
}
