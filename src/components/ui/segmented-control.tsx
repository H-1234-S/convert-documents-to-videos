"use client";

import { motion } from "framer-motion";
import * as React from "react";

export interface SegmentedControlOption<T> {
  label: string;
  value: T;
}

export interface SegmentedControlProps<T> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  className = "",
}: SegmentedControlProps<T>) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={`relative inline-flex items-center gap-1 rounded-full bg-muted p-1 ${className}`}
      role="tablist"
    >
      {options.map((option, index) => {
        const isSelected = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(option.value)}
            className={`relative z-10 min-h-[40px] rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              isSelected
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/80"
            }`}
          >
            {isSelected && mounted && (
              <motion.div
                layoutId="indicator"
                className="absolute inset-0 rounded-full bg-background shadow-sm"
                style={{ zIndex: -1 }}
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 30,
                  duration: 0.3,
                }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
