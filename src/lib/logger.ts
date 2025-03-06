// src/lib/logger.ts

// Log levels
export type LogLevel = "debug" | "info" | "warn" | "error";

// Environment check
const isDev = process.env.NODE_ENV === "development";

/**
 * A structured logger for client-side use
 * In production, this could be extended to send logs to a service like Sentry, LogRocket, etc.
 */
class Logger {
  private prefix: string;

  constructor(prefix: string = "") {
    this.prefix = prefix ? `[${prefix}]` : "";
  }

  /**
   * Get formatted timestamp for logs
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Format a message with context information
   */
  private format(level: LogLevel, message: string): string {
    return `${this.getTimestamp()} ${level.toUpperCase()} ${
      this.prefix
    } ${message}`;
  }

  /**
   * Debug level logging
   * Only appears in development
   */
  debug(message: string, data?: unknown): void {
    if (isDev) {
      console.debug(this.format("debug", message), data ?? "");
    }
  }

  /**
   * Info level logging
   */
  info(message: string, data?: unknown): void {
    console.info(this.format("info", message), data ?? "");
  }

  /**
   * Warning level logging
   */
  warn(message: string, data?: unknown): void {
    console.warn(this.format("warn", message), data ?? "");
  }

  /**
   * Error level logging
   */
  error(message: string, error?: unknown): void {
    // Format error objects specially
    let formattedError: Record<string, unknown> | unknown = error;

    if (error instanceof Error) {
      // Extract standard properties
      formattedError = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };

      // Safely extract any additional properties
      try {
        // Get all property names, including non-enumerable ones
        const errorKeys = Object.getOwnPropertyNames(error);

        // Add each property that isn't already captured
        for (const key of errorKeys) {
          if (key !== "name" && key !== "message" && key !== "stack") {
            // Safe access via indexer, with type assertion
            (formattedError as Record<string, unknown>)[key] = (
              error as unknown as Record<string, unknown>
            )[key];
          }
        }
      } catch {
        // If we can't extract properties, just add a note
        (formattedError as Record<string, unknown>).note =
          "Additional properties could not be extracted";
      }
    }

    console.error(this.format("error", message), formattedError ?? "");

    // In production, you could send this to a service like Sentry
    // Example: if (typeof window !== 'undefined' && !isDev) Sentry.captureException(error);
  }

  /**
   * Create a child logger with a nested prefix
   */
  child(childPrefix: string): Logger {
    const prefix = this.prefix
      ? `${this.prefix.slice(1, -1)}:${childPrefix}`
      : childPrefix;
    return new Logger(prefix);
  }
}

// Create and export default logger instance
export const logger = new Logger();

// Helper function to create module-specific loggers
export function createLogger(module: string): Logger {
  return new Logger(module);
}
