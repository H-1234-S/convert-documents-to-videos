"use client";

import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { LandingHero } from "@/components/landing/LandingHero";
import { MainApp } from "@/components/main-app/MainApp";

/**
 * 首页路由：认证态分流。
 *
 * - isPending → 全屏深色 Loader（防闪屏）
 * - !session → LandingHero（未认证）
 * - session → MainApp（已认证）
 */
export default function Home() {
  const { data: session, isPending } = useSession();

  // 闪屏防护：session 解析中
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  // 未认证 → Landing
  if (!session) {
    return <LandingHero />;
  }

  // 已认证 → MainApp
  return <MainApp />;
}
