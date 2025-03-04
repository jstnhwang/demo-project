"use client";

import type { ToastActionElement, ToastProps } from "@/components/ui/toast";
import * as React from "react";

const TOAST_LIMIT = 5;
const DEFAULT_TOAST_DURATION = 5000; // 5 seconds default duration
const ANIMATION_DURATION = 300; // Match this with your framer-motion duration

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  duration?: number;
  open?: boolean;
};

type Action =
  | {
      type: "ADD_TOAST";
      toast: ToasterToast;
    }
  | {
      type: "UPDATE_TOAST";
      toast: Partial<ToasterToast>;
    }
  | {
      type: "DISMISS_TOAST";
      toastId?: ToasterToast["id"];
    }
  | {
      type: "REMOVE_TOAST";
      toastId?: ToasterToast["id"];
    };

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (
  toastId: string,
  duration = DEFAULT_TOAST_DURATION
) => {
  // Clear any existing timeout for this toast
  const existingTimeout = toastTimeouts.get(toastId);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }

  // Set a new timeout to dismiss the toast (trigger the exit animation)
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "DISMISS_TOAST",
      toastId: toastId,
    });

    // After animation completes, actually remove the toast from the array
    setTimeout(() => {
      dispatch({
        type: "REMOVE_TOAST",
        toastId: toastId,
      });
    }, ANIMATION_DURATION);
  }, duration);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map(t =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };
    case "DISMISS_TOAST": {
      const { toastId } = action;
      return {
        ...state,
        toasts: state.toasts.map(t =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach(listener => {
    listener(memoryState);
  });
}

type Toast = Omit<ToasterToast, "id">;

function toast({ duration = DEFAULT_TOAST_DURATION, ...props }: Toast) {
  const id = genId();

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });

  const dismiss = () => {
    dispatch({ type: "DISMISS_TOAST", toastId: id });

    // After animation completes, remove the toast
    setTimeout(() => {
      dispatch({ type: "REMOVE_TOAST", toastId: id });
    }, ANIMATION_DURATION);
  };

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dismiss();
      },
    },
  });

  // Set up auto-dismiss
  addToRemoveQueue(id, duration);

  return {
    id: id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => {
      dispatch({ type: "DISMISS_TOAST", toastId });

      // If toastId is specified, wait for animation then remove
      if (toastId) {
        setTimeout(() => {
          dispatch({ type: "REMOVE_TOAST", toastId });
        }, ANIMATION_DURATION);
      } else {
        // If no toastId, dismiss all toasts and then remove them after animation
        setTimeout(() => {
          dispatch({ type: "REMOVE_TOAST" });
        }, ANIMATION_DURATION);
      }
    },
  };
}

export { toast, useToast };
