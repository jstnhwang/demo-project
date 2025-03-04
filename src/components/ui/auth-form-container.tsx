"use client";

import React from "react";

interface AuthFormContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthFormContainer({
  children,
  title,
  subtitle,
}: AuthFormContainerProps) {
  return (
    <>
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-content mb-2">{title}</h2>
            <p className="text-content-50">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>

      <div className="p-4 text-center border-t border-base-300">
        <p className="text-xs text-content-50">
          By signing in, you agree to our{" "}
          <a
            href="#"
            className="underline-offset-4 hover:underline text-primary"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="underline-offset-4 hover:underline text-primary"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </>
  );
}
