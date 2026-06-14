"use client";

import { useState, useCallback } from "react";
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea";
import { IconButton, type IconButtonState } from "@/components/ui/icon-button";
import { FadeMask } from "@/components/ui/fade-mask";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";

interface GenerateTabProps {
  onTabChange: (tab: "history") => void;
}

/** 硬编码的生成配置参数 */
const DEFAULT_CONFIG = {
  aspectRatio: "16:9" as const,
  targetDurationSec: 120,
  audienceRole: "student",
  audienceLevel: "intermediate",
  voiceProvider: "minimax",
  voiceId: "male-qn-qingse",
};

/**
 * 生成视频 Tab：OpenAI 风格输入，极简黑白设计。
 *
 * 功能：
 * - 调用 project.createAndGenerate mutation
 * - 单行起始，居中显示，向下扩展至最多 6 行
 * - 图标按钮（Send/Loader2），内嵌在输入框右下角
 * - 最后一行专门保留给按钮，不显示文本
 * - 垂直渐变遮罩（从上到下）防止文字与按钮重叠
 * - 防重复提交（isPending 时 button + textarea 均 disabled）
 * - 空文本 guard（button disabled）
 * - 成功：清空输入、toast、自动切换到历史 Tab
 * - 失败：toast error、保留输入文本
 */
export function GenerateTab({ onTabChange }: GenerateTabProps) {
  const [text, setText] = useState("");

  const createMutation = trpc.project.createAndGenerate.useMutation({
    onSuccess: () => {
      setText("");
      toast.success("项目创建成功，正在生成中…");
      onTabChange("history");
    },
    onError: (error) => {
      toast.error(error.message || "创建失败，请重试");
    },
  });

  const isPending = createMutation.isPending;
  const isTextEmpty = text.trim().length === 0;

  // Determine button state
  const buttonState: IconButtonState = isPending
    ? "pending"
    : isTextEmpty
      ? "disabled"
      : "ready";

  const handleSubmit = useCallback(() => {
    if (isTextEmpty || isPending) return;
    createMutation.mutate({
      sourceText: text.trim(),
      requestId: crypto.randomUUID(),
      ...DEFAULT_CONFIG,
    });
  }, [text, isTextEmpty, isPending, createMutation]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-6 py-12">
      <div className="w-full max-w-3xl">
        {/* 输入区域容器 - relative positioning for absolute children */}
        <div className="relative">
          {/* 自动调整高度的文本输入 - 6 行上限，最后一行专门保留给按钮 */}
          <AutoResizeTextarea
            placeholder="描述你想生成的视频内容..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isPending}
            minHeight={56}
            maxLines={6}
            paddingRight="pr-14"
            paddingBottom="pb-14"
            className="w-full"
          />

          {/* 渐变遮罩 - 防止文字与按钮重叠 */}
          <FadeMask />

          {/* 图标按钮 - 绝对定位在右下角 */}
          <div className="absolute bottom-3 right-3 z-20">
            <IconButton
              state={buttonState}
              onClick={handleSubmit}
              aria-label="生成视频"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
