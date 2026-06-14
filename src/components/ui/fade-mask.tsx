"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface FadeMaskProps {
  className?: string;
}

/**
 * FadeMask - 垂直渐变遮罩层
 *
 * 用于在提交按钮上方实现文本淡出效果。
 * 遮罩从透明（顶部）渐变到背景色（底部，按钮上方），
 * 确保文本在接近按钮专用行时平滑淡出。
 */
export const FadeMask = React.forwardRef<HTMLDivElement, FadeMaskProps>(
  ({ className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Absolute positioning at bottom-right
          "absolute bottom-0 right-0",
          // Dimensions: cover button area plus 2-3 lines above (~60-80px height)
          "h-20 w-full", // Full width, ~80px height
          // Vertical gradient: fade from transparent (top) to background (bottom)
          "bg-gradient-to-b from-transparent via-background/60 to-background",
          // Pointer events: don't block button clicks or text selection
          "pointer-events-none",
          // Z-index: between textarea and button
          "z-10",
          className
        )}
        aria-hidden="true"
      />
    );
  }
);

FadeMask.displayName = "FadeMask";
