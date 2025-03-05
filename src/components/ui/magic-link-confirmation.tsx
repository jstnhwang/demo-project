"use client";

import { CheckCircle, Mail, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

interface MagicLinkConfirmationProps {
  email: string;
  onResendClick: () => Promise<void>;
  resendDisabled?: boolean;
}

export function MagicLinkConfirmation({
  email,
  onResendClick,
  resendDisabled = false,
}: MagicLinkConfirmationProps) {
  // Countdown timer for resend (60 seconds)
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  // Start countdown when component mounts
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format timer as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle resend click
  const handleResend = async () => {
    if (countdown > 0 || resendDisabled || isResending) return;

    setIsResending(true);
    try {
      await onResendClick();
      // Reset countdown
      setCountdown(60);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-base-200 rounded-lg p-6 my-6 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
          <Mail className="w-8 h-8 text-success" />
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-2">Check your email</h3>

      <div className="mb-4">
        <p>We&apos;ve sent a magic link to:</p>
        <p className="font-semibold mt-1">{email}</p>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2 justify-center">
          <CheckCircle className="w-4 h-4 text-success" />
          <span>Click the link in your email to continue</span>
        </div>

        <p className="text-neutral-content text-xs">
          The link will expire in 24 hours
        </p>

        <div className="divider text-xs text-neutral-content">
          CAN&apos;T FIND THE EMAIL?
        </div>

        <div className="space-y-2 text-sm">
          <p>Check your spam or junk folder</p>

          <button
            onClick={handleResend}
            disabled={countdown > 0 || resendDisabled || isResending}
            className="btn btn-sm btn-outline mt-2 gap-2"
          >
            {isResending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : countdown > 0 ? (
              <>
                <RefreshCw className="w-4 h-4" />
                Resend in {formatTime(countdown)}
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Resend magic link
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
