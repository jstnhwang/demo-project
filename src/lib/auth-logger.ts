// src/lib/auth-logger.ts
import { createLogger } from "./logger";

// Create an auth-specific logger
export const authLogger = createLogger("auth");

// Define types for auth-related data
export interface AuthData {
  email?: string;
  fullName?: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  [key: string]: unknown;
}

// Log redaction function for sensitive data
export function redactSensitiveData<T extends Record<string, unknown>>(
  data: T
): Partial<T> {
  if (!data) return data;

  // Create a safe copy
  const safeCopy: Record<string, unknown> = { ...data };

  // List of keys to redact
  const sensitiveKeys = [
    "password",
    "token",
    "accessToken",
    "refreshToken",
    "secret",
    "apiKey",
    "authorization",
    "credential",
  ];

  // Redact sensitive keys
  for (const key of Object.keys(safeCopy)) {
    const lowerKey = key.toLowerCase();

    // Check if this is a sensitive key
    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      safeCopy[key] = "[REDACTED]";
    }

    // Recursively redact nested objects
    else if (typeof safeCopy[key] === "object" && safeCopy[key] !== null) {
      safeCopy[key] = redactSensitiveData(
        safeCopy[key] as Record<string, unknown>
      );
    }
  }

  return safeCopy as Partial<T>;
}

// Specialized auth logging functions
export const authLogEvents = {
  // Auth attempts
  attemptSignIn: (method: string, data: AuthData) => {
    authLogger.info(
      `Attempting sign-in via ${method}`,
      redactSensitiveData(data)
    );
  },

  attemptSignUp: (method: string, data: AuthData) => {
    authLogger.info(
      `Attempting sign-up via ${method}`,
      redactSensitiveData(data)
    );
  },

  // Success events
  signInSuccess: (method: string, userId?: string) => {
    authLogger.info(`Sign-in successful via ${method}`, { userId });
  },

  signUpSuccess: (method: string, userId?: string) => {
    authLogger.info(`Sign-up successful via ${method}`, { userId });
  },

  magicLinkSent: (email: string) => {
    // Partially redact email for privacy while keeping enough for debugging
    const redactedEmail = email.replace(/(.{2})(.*)(@.*)/, "$1****$3");
    authLogger.info(`Magic link sent`, { email: redactedEmail });
  },

  // Error events
  signInError: (method: string, error: unknown) => {
    authLogger.error(`Sign-in failed via ${method}`, error);
  },

  signUpError: (method: string, error: unknown) => {
    authLogger.error(`Sign-up failed via ${method}`, error);
  },

  magicLinkError: (error: unknown) => {
    authLogger.error(`Magic link error`, error);
  },

  // Session events
  sessionChanged: (event: string) => {
    authLogger.info(`Auth session state changed: ${event}`);
  },

  passwordReset: (
    status: "request" | "success" | "error",
    data?: AuthData | unknown
  ) => {
    if (status === "request") {
      authLogger.info(
        "Password reset requested",
        redactSensitiveData(data as AuthData)
      );
    } else if (status === "success") {
      authLogger.info(
        "Password reset email sent successfully",
        redactSensitiveData(data as AuthData)
      );
    } else {
      authLogger.error("Password reset error", data);
    }
  },

  passwordUpdate: (status: "attempt" | "success" | "error", data?: unknown) => {
    if (status === "attempt") {
      authLogger.info("Password update attempted");
    } else if (status === "success") {
      authLogger.info("Password updated successfully");
    } else {
      authLogger.error("Password update error", data);
    }
  },
};
