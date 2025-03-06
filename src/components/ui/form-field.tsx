"use client";

import { cn } from "@/lib/utils";
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
}: FormFieldProps) {
  const [touched, setTouched] = useState(false);

  const handleBlur = () => {
    setTouched(true);
    if (onBlur) onBlur();
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      <input
        id={id}
        type={type}
        className={cn(
          "input input-md w-full",
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
      {error && touched && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  );
}
