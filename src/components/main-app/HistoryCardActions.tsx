"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";

interface HistoryCardActionsProps {
  project: {
    id: string;
    status: string;
  };
}

/**
 * 历史记录卡片操作栏：播放 + 删除 + 条件重试。
 *
 * - 播放按钮 → 导航到 /projects/[id]/play
 * - 删除按钮 → project.delete mutation
 * - 重试按钮 → 仅 failed/cancelled 显示，调用 project.retry mutation
 */
export function HistoryCardActions({ project }: HistoryCardActionsProps) {
  const utils = trpc.useUtils();

  const deleteMutation = trpc.project.delete.useMutation({
    onSuccess: () => {
      toast.success("项目已删除");
      utils.project.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "删除失败");
    },
  });

  const retryMutation = trpc.project.retry.useMutation({
    onSuccess: () => {
      toast.success("已重新提交生成");
      utils.project.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "重试失败");
    },
  });

  const showRetry = project.status === "failed" || project.status === "cancelled";

  const handlePlay = useCallback(() => {
    window.location.href = `/projects/${project.id}/play`;
  }, [project.id]);

  const handleDelete = useCallback(() => {
    deleteMutation.mutate({ projectId: project.id });
  }, [deleteMutation, project.id]);

  const handleRetry = useCallback(() => {
    retryMutation.mutate({ projectId: project.id });
  }, [retryMutation, project.id]);

  return (
    <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
      <Button variant="ghost" size="sm" onClick={handlePlay}>
        ▶ 播放
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={deleteMutation.isPending}
      >
        🗑 删除
      </Button>
      {showRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRetry}
          disabled={retryMutation.isPending}
        >
          🔄 重试
        </Button>
      )}
    </div>
  );
}
