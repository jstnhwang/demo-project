export type AuthErrorType =
  | "invalid_credentials"
  | "unverified_email"
  | "rate_limited"
  | "network_error"
  | "user_cancelled"
  | "account_conflict"
  | "not_found"
  | "unknown";

interface AuthErrorInfo {
  type: AuthErrorType;
  message: string;
}

/**
 * Processes authentication errors and returns standardized error information
 */
export function handleAuthError(
  error: unknown,
  context: "signin" | "signup" | "magic_link" | "social"
): AuthErrorInfo {
  // Default error info
  let errorInfo: AuthErrorInfo = {
    type: "unknown",
    message:
      context === "signup"
        ? "An unexpected error occurred during sign up."
        : "An unexpected error occurred during sign in.",
  };

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    // Credentials errors
    if (msg.includes("invalid_credentials") || msg.includes("invalid login")) {
      errorInfo = {
        type: "invalid_credentials",
        message: "Email or password is incorrect. Please try again.",
      };
    }
    // Email verification
    else if (
      msg.includes("not verified") ||
      msg.includes("confirm your email")
    ) {
      errorInfo = {
        type: "unverified_email",
        message: "Please verify your email before signing in.",
      };
    }
    // Rate limiting
    else if (msg.includes("too many requests") || msg.includes("rate limit")) {
      errorInfo = {
        type: "rate_limited",
        message: "Too many attempts. Please try again later.",
      };
    }
    // Network issues
    else if (msg.includes("network")) {
      errorInfo = {
        type: "network_error",
        message: "Network error. Please check your connection and try again.",
      };
    }
    // User cancelled OAuth popup
    else if (
      msg.includes("popup_closed_by_user") ||
      msg.includes("cancelled")
    ) {
      errorInfo = {
        type: "user_cancelled",
        message: "Authentication was cancelled.",
      };
    }
    // Account conflicts (OAuth provider conflicts)
    else if (msg.includes("account_exists")) {
      errorInfo = {
        type: "account_conflict",
        message:
          "An account with this email already exists using a different sign-in method.",
      };
    }
    // Account not found (magic link)
    else if (msg.includes("does not exist") || msg.includes("not found")) {
      errorInfo = {
        type: "not_found",
        message:
          context === "signup"
            ? "Unable to create account with this email."
            : "No account found with this email address.",
      };
    }
  }

  // Context-specific message adjustments
  if (context === "magic_link" && errorInfo.type === "unknown") {
    errorInfo.message = "Failed to send magic link. Please try again.";
  } else if (context === "social" && errorInfo.type === "unknown") {
    errorInfo.message = "Failed to authenticate. Please try again.";
  }

  return errorInfo;
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  // RFC 5322 compliant regex
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 */
export function isStrongPassword(password: string): boolean {
  // At least 8 characters, with 1+ uppercase, lowercase, and number
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  );
}
