"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * 骨架卡片：历史记录加载中时显示。
 *
 * 渲染 3 个脉冲骨架卡片，模拟 FocusCards 布局。
 */
export function VideoCardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto md:px-8 w-full">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg overflow-hidden h-60 md:h-96 w-full">
          <Skeleton className="h-full w-full" />
        </div>
      ))}
    </div>
  );
}
