"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Film } from "lucide-react";
import { toast } from "sonner";

interface PlayPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 视频播放占位页 `/projects/[id]/play`。
 *
 * 功能：
 * - 通过 project.getById 获取项目标题
 * - 显示"视频播放功能即将推出"占位消息
 * - 提供删除按钮（成功后跳转回首页）
 * - 失败/取消状态显示重试按钮
 */
export default function PlayPage({ params }: PlayPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: project, isLoading, isError } = trpc.project.getById.useQuery({
    projectId: id,
  });

  const deleteMutation = trpc.project.delete.useMutation({
    onSuccess: () => {
      toast.success("项目已删除");
      utils.project.list.invalidate();
      router.push("/");
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

  const isFailedOrCancelled =
    project?.status === "failed" || project?.status === "cancelled";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {isLoading ? (
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      ) : isError || !project ? (
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">项目加载失败</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/")}
            >
              返回首页
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Film className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <CardTitle className="text-xl">{project.title}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              视频播放功能即将推出
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
              >
                返回
              </Button>
              {isFailedOrCancelled && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => retryMutation.mutate({ projectId: id })}
                  disabled={retryMutation.isPending}
                >
                  {retryMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : null}
                  重试生成
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteMutation.mutate({ projectId: id })}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : null}
                删除
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
