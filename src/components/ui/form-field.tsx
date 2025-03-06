"use client";

import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";

interface FormFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  onBlur?: () => void;
  className?: string;
  autoComplete?: string;
  rightElement?: React.ReactNode; // For elements like "Forgot password" link
}

export function FormField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  onBlur,
  className,
  autoComplete,
  rightElement,
}: FormFieldProps) {
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleBlur = () => {
    setTouched(true);
    if (onBlur) onBlur();
  };

  // Determine if this is a password field
  const isPassword = type === "password";
  // Use text type when showPassword is true, otherwise use the original type
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-medium">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
        {rightElement}
      </div>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          className={cn(
            "input input-md w-full",
            isPassword ? "pr-10" : "", // Add padding for the toggle button
            error && touched ? "input-error border-error" : "",
            className
          )}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          required={required}
          autoComplete={autoComplete}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-content-50 hover:text-content hover:cursor-pointer focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && touched && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  );
}
