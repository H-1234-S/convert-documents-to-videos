"use client";

import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  /** 点击重试按钮时调用 */
  onRetry: () => void;
}

/**
 * 历史记录加载失败时的错误状态：极简黑白设计。
 */
export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
      <p className="text-base text-muted-foreground mb-8">
        加载失败，请重试
      </p>
      <Button
        variant="outline"
        onClick={onRetry}
        size="lg"
      >
        重新加载
      </Button>
    </div>
  );
}
