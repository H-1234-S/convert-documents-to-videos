"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type IconButtonState = "disabled" | "ready" | "pending";

export interface IconButtonProps {
  state: IconButtonState;
  onClick?: () => void;
  className?: string;
  "aria-label"?: string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ state, onClick, className, "aria-label": ariaLabel = "生成视频" }, ref) => {
    const isDisabled = state === "disabled" || state === "pending";

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        aria-label={ariaLabel}
        className={cn(
          // Base styles: circular, fixed size, centered icon
          "inline-flex items-center justify-center rounded-full",
          "h-10 w-10", // 40px touch target
          "transition-all duration-150",
          // State-based styles
          state === "disabled" &&
            "bg-muted text-muted-foreground cursor-not-allowed",
          state === "ready" &&
            "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 cursor-pointer",
          state === "pending" &&
            "bg-primary text-primary-foreground cursor-not-allowed opacity-80",
          className
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {state === "pending" ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <Loader2 className="h-5 w-5 animate-spin" />
            </motion.div>
          ) : (
            <motion.div
              key="send"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <Send className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
