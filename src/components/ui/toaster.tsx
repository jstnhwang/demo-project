"use client";

import { Toast, ToastDescription, ToastTitle } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 flex flex-col gap-2 z-50 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(
          ({ id, title, description, action, open = true, ...props }) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{
                opacity: 0,
                x: 100,
                transition: {
                  duration: 0.3,
                  ease: "easeInOut",
                },
              }}
              transition={{
                duration: 0.3,
                type: "tween",
              }}
              className="pointer-events-auto"
            >
              <Toast
                {...props}
                open={open}
                onOpenChange={isOpen => {
                  if (!isOpen) {
                    props.onOpenChange?.(isOpen);
                  }
                }}
              >
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
                {action}
              </Toast>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
