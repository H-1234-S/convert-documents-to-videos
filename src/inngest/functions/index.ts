import { inngest, EVENTS } from "@/inngest/client";
import type { GenerateRequestedEvent } from "@/inngest/client";

/**
 * video/generate.requested 占位 handler
 *
 * 当前为 no-op 占位实现，仅用于验证事件管道连通性。
 * 实际 AI 视频生成流水线逻辑在 ep3-04 实现。
 */
const handleGenerateRequested = inngest.createFunction(
  {
    id: "video-generate-requested-placeholder",
    triggers: [{ event: EVENTS.VIDEO_GENERATE_REQUESTED }],
  },
  async ({ event }) => {
    const { projectId, userId, jobId } = event.data as GenerateRequestedEvent;
    console.log(
      `[Inngest] 收到 video/generate.requested 事件: projectId=${projectId}, userId=${userId}, jobId=${jobId}`,
    );
    // TODO (ep3-04): 实现完整 AI 流水线（storyboard → audio → render）
    return { success: true, projectId, jobId };
  },
);

export const functions = [handleGenerateRequested];
