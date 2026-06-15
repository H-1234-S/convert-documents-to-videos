"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { VideoCardSkeleton } from "./VideoCardSkeleton";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { HistoryCardActions } from "./HistoryCardActions";
/**
 * 与 ProjectListItem 对应，但 createdAt/updatedAt 在 tRPC 序列化后为 string。
 */
interface ProjectCardItem {
  id: string;
  title: string;
  status: string;
  aspectRatio: string;
  targetDurationSec: number | null;
  createdAt: string;
  updatedAt: string;
  currentJob: { id: string; jobType: string; status: string } | null;
}

interface HistoryTabProps {
  onTabChange: (tab: "generate") => void;
}

/** SVG data URI 占位图颜色轮换（按 index 循环 5 色） */
const PLACEHOLDER_COLORS = [
  "#f59e0b", // amber
  "#3b82f6", // blue
  "#10b981", // emerald
  "#8b5cf6", // violet
  "#ec4899", // pink
];

/** 各状态下使用的颜色覆盖（黑白系） */
const STATUS_OVERRIDE_COLORS: Record<string, string> = {
  // in-progress: 灰色
  queued: "#737373",
  generating_storyboard: "#737373",
  storyboard_ready: "#525252",
  generating_audio: "#737373",
  calculating_timeline: "#737373",
  rendering: "#525252",
  // failed: 深灰
  failed: "#404040",
  // cancelled: 浅灰
  cancelled: "#a3a3a3",
  // completed: 黑色
  completed: "#171717",
};

/** 各状态下显示的标签 */
function getStatusLabel(status: string): string {
  switch (status) {
    case "completed":
      return "已完成";
    case "failed":
      return "生成失败";
    case "cancelled":
      return "已取消";
    case "storyboard_ready":
      return "分镜就绪";
    case "queued":
    case "generating_storyboard":
    case "generating_audio":
    case "calculating_timeline":
    case "rendering":
      return "生成中…";
    default:
      return status;
  }
}

/** 是否为活跃/进行中状态 */
function isActiveStatus(status: string): boolean {
  return [
    "queued",
    "generating_storyboard",
    "generating_audio",
    "calculating_timeline",
    "rendering",
  ].includes(status);
}

/**
 * 生成 SVG data URI 占位图片。
 *
 * @param color - 背景色（hex）
 * @param text - 显示的文本
 * @returns `data:image/svg+xml,...` 字符串
 */
function generatePlaceholder(color: string, text: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="${color}" />
  <text x="200" y="155" text-anchor="middle" font-family="sans-serif" font-size="16" fill="white">${text}</text>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * 将 ProjectListItem 转换为 FocusCards 需要的 card 格式。
 */
function toFocusCard(item: ProjectCardItem, index: number) {
  const overrideColor = STATUS_OVERRIDE_COLORS[item.status];
  const color = overrideColor ?? PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length];
  const label = getStatusLabel(item.status);
  const src = generatePlaceholder(color, label);
  return {
    title: item.title,
    src,
    // 携带原始数据用于 action bar
    _project: item,
    _color: color,
    _label: label,
    _isActive: isActiveStatus(item.status),
  };
}

/**
 * 历史记录 Tab：FocusCards 展示项目列表，含：
 * - 10 秒自动轮询
 * - 骨架/空/错误三种状态
 * - 状态颜色区分 + 标签
 * - 卡片操作栏
 * - 卡片点击 → /projects/[id]/play
 */
export function HistoryTab({ onTabChange }: HistoryTabProps) {
  const trpc = useTRPC();
  const { data, isLoading, isError, refetch } = useQuery(
    trpc.project.list.queryOptions(
      { pageSize: 50 },
      { refetchInterval: 10_000 },
    ),
  );

  // 过滤掉已删除项目
  const filteredItems = useMemo(
    () => (data?.items ?? []).filter((item) => item.status !== "deleted"),
    [data],
  );

  const cards = useMemo(
    () => filteredItems.map(toFocusCard),
    [filteredItems],
  );

  // ---- 加载态：首次加载（无缓存数据）----
  if (isLoading && !data) {
    return <VideoCardSkeleton />;
  }

  // ---- 错误态 ----
  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  // ---- 空态 ----
  if (filteredItems.length === 0) {
    return <EmptyState onGenerateClick={() => onTabChange("generate")} />;
  }

  // ---- 正常态：极简列表布局 ----
  return (
    <div className="py-12 px-6 max-w-5xl mx-auto">
      <div className="space-y-1">
        {cards.map((card, index) => (
          <Link
            key={filteredItems[index].id}
            href={`/projects/${filteredItems[index].id}/play`}
            className="group block"
          >
            <div className="flex items-center justify-between py-6 border-b border-border transition-colors hover:bg-muted/30">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-normal text-foreground truncate group-hover:text-foreground/80 transition-colors">
                  {card.title}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>{card._label}</span>
                  {filteredItems[index].targetDurationSec && (
                    <span>{Math.floor(filteredItems[index].targetDurationSec! / 60)} 分钟</span>
                  )}
                  <span>{new Date(filteredItems[index].createdAt).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>

              {/* Action bar */}
              <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <HistoryCardActions project={filteredItems[index]} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
