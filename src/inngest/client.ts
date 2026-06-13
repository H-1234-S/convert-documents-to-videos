import { Inngest } from "inngest";

// ---- Constants ----

/** Inngest 事件名称常量 */
export const EVENTS = {
  /** 用户提交文本，请求 AI 视频生成 */
  VIDEO_GENERATE_REQUESTED: "video/generate.requested",
} as const;

// ---- Event Types ----

/** `video/generate.requested` 事件 payload */
export interface GenerateRequestedEvent {
  /** 创建的 Project ID */
  projectId: string;
  /** 发起请求的用户 ID */
  userId: string;
  /** 创建的 GenerationJob ID */
  jobId: string;
}

// ---- Client Singleton ----

export const inngest = new Inngest({
  id: "Volcano",
  baseUrl: process.env.INNGEST_BASE_URL,
  eventKey: process.env.INNGEST_EVENT_KEY,
});

// ---- Helpers ----

/**
 * 发送 `video/generate.requested` 事件到 Inngest。
 *
 * 调用时机：Project + GenerationJob 事务提交成功后。
 * 发送失败不阻塞 API 响应——由 ep7-03 定时扫描补偿 stuck projects。
 *
 * @param params - 事件 payload
 */
export async function sendGenerateRequested(
  params: GenerateRequestedEvent,
): Promise<void> {
  await inngest.send({
    name: EVENTS.VIDEO_GENERATE_REQUESTED,
    data: params,
  });
}
