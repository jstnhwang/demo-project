import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";

const toastVariants = cva(
  "alert shadow-lg max-w-md w-full transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "alert-info",
        success: "alert-success",
        error: "alert-error",
        warning: "alert-warning",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export type ToastActionElement = React.ReactElement;

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, children, open, onOpenChange, ...props }, ref) => {
    if (!open) return null;

    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
        role="alert"
      >
        <div className="flex-1">{children}</div>
        <div className="flex-none">
          <button
            onClick={() => onOpenChange?.(false)}
            className="btn btn-ghost btn-xs"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }
);
Toast.displayName = "Toast";

const ToastTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold text-base", className)}
    {...props}
  />
));
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
));
ToastDescription.displayName = "ToastDescription";

const ToastAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex shrink-0 items-center justify-end", className)}
    {...props}
  />
));
ToastAction.displayName = "ToastAction";

export { Toast, ToastAction, ToastDescription, ToastTitle };
