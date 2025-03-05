// lib/schemas/auth-schema.ts
import { z } from "zod";

// Individual password criteria validators
export const passwordCriteria = {
  hasUppercase: (password: string) => /[A-Z]/.test(password),
  hasLowercase: (password: string) => /[a-z]/.test(password),
  hasNumber: (password: string) => /[0-9]/.test(password),
  hasSpecialChar: (password: string) =>
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  hasMinLength: (password: string) => password.length >= 8,
};

// Password schema with all requirements
export const passwordSchema = z
  .string()
  .refine(passwordCriteria.hasUppercase, {
    message: "Password must contain at least one uppercase letter",
  })
  .refine(passwordCriteria.hasLowercase, {
    message: "Password must contain at least one lowercase letter",
  })
  .refine(passwordCriteria.hasNumber, {
    message: "Password must contain at least one number",
  })
  .refine(passwordCriteria.hasSpecialChar, {
    message: "Password must contain at least one special character",
  })
  .refine(passwordCriteria.hasMinLength, {
    message: "Password must be at least 8 characters long",
  });

// Complete sign up form schema
export const signUpSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  password: passwordSchema,
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;
