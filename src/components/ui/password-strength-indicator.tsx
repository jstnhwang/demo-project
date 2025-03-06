"use client";

import { passwordCriteria } from "@/lib/schemas/auth-schema";
import { CheckCircle2, Circle } from "lucide-react";
import { useMemo } from "react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const criteriaItems = useMemo(
    () => [
      {
        label: "Uppercase letter",
        validator: passwordCriteria.hasUppercase,
      },
      {
        label: "Lowercase letter",
        validator: passwordCriteria.hasLowercase,
      },
      {
        label: "Number",
        validator: passwordCriteria.hasNumber,
      },
      {
        label: "Special character (e.g. !?<>@#$%)",
        validator: passwordCriteria.hasSpecialChar,
      },
      {
        label: "8 characters or more",
        validator: passwordCriteria.hasMinLength,
      },
    ],
    []
  );

  return (
    <div className="mt-2 space-y-2">
      <div className="grid grid-cols-1  gap-y-1 gap-x-3">
        {criteriaItems.map((item, index) => {
          const isMet = item.validator(password);
          return (
            <div
              key={index}
              className={`flex items-center text-xs transition-colors ${
                isMet ? "text-success" : "text-neutral-400"
              }`}
            >
              {isMet ? (
                <CheckCircle2 size={14} className="mr-1.5 flex-shrink-0" />
              ) : (
                <Circle size={14} className="mr-1.5 flex-shrink-0" />
              )}
              {item.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
