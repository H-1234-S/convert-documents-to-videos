"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface AutoResizeTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "rows"> {
  maxHeight?: number; // in pixels (takes precedence over maxLines if provided)
  minHeight?: number; // in pixels
  maxLines?: number; // maximum number of lines (default: 10)
  paddingRight?: string; // custom right padding (e.g., "pr-12")
  paddingBottom?: string; // custom bottom padding (e.g., "pb-12")
}

export const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(
  (
    {
      className,
      maxHeight: maxHeightProp,
      minHeight = 56,
      maxLines = 10,
      paddingRight,
      paddingBottom,
      onChange,
      value,
      ...props
    },
    ref
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const [height, setHeight] = React.useState<number>(minHeight);
    const [computedMaxHeight, setComputedMaxHeight] = React.useState<number>(
      maxHeightProp || 240
    );

    // Calculate line height and max height based on maxLines
    React.useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // If maxHeight is explicitly provided, use it
      if (maxHeightProp) {
        setComputedMaxHeight(maxHeightProp);
        return;
      }

      // Otherwise, calculate based on maxLines
      const styles = window.getComputedStyle(textarea);
      const lineHeight = parseFloat(styles.lineHeight);
      const paddingTop = parseFloat(styles.paddingTop);
      const paddingBottom = parseFloat(styles.paddingBottom);

      if (!isNaN(lineHeight)) {
        const calculatedMaxHeight = lineHeight * maxLines + paddingTop + paddingBottom;
        setComputedMaxHeight(calculatedMaxHeight);
      }
    }, [maxLines, maxHeightProp]);

    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Reset height to auto to get accurate scrollHeight
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;

      // Apply min and max constraints
      const newHeight = Math.min(
        Math.max(scrollHeight, minHeight),
        computedMaxHeight
      );
      setHeight(newHeight);
    }, [minHeight, computedMaxHeight]);

    React.useEffect(() => {
      adjustHeight();
    }, [value, adjustHeight]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      adjustHeight();
      onChange?.(e);
    };

    return (
      <textarea
        ref={(node) => {
          textareaRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={cn(
          "flex w-full rounded-2xl border border-input bg-background px-4 py-3 text-base leading-relaxed text-foreground placeholder:text-muted-foreground transition-all duration-150",
          "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-none",
          paddingRight,
          paddingBottom,
          className
        )}
        style={{
          height: `${height}px`,
          overflowY: height >= computedMaxHeight ? "auto" : "hidden",
        }}
        value={value}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

AutoResizeTextarea.displayName = "AutoResizeTextarea";
