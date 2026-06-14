"use client";

import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  /** 点击 CTA 按钮时调用，典型用法：切换到 generate tab */
  onGenerateClick: () => void;
}

/**
 * 历史记录为空时的占位状态：极简黑白设计。
 */
export function EmptyState({ onGenerateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
      <p className="text-base text-muted-foreground mb-8">
        还没有生成视频
      </p>
      <Button
        onClick={onGenerateClick}
        size="lg"
      >
        开始生成
      </Button>
    </div>
  );
}
