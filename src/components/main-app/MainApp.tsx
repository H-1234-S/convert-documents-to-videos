"use client";

import { useState } from "react";
import { AppNavbar } from "./AppNavbar";
import { GenerateTab } from "./GenerateTab";
import { HistoryTab } from "./HistoryTab";
import { SubscribeTab } from "./SubscribeTab";

type Tab = "generate" | "history" | "subscribe";

/**
 * MainApp 主应用壳：极简黑白设计。
 *
 * 默认 Tab 为 "generate"（生成视频）。
 * Tab 状态由 useState 管理，不写入 URL。
 */
export function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>("generate");

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 内容区：offset top 留出 navbar 高度 */}
      <div className="pt-14">
        {activeTab === "generate" && (
          <GenerateTab onTabChange={setActiveTab} />
        )}
        {activeTab === "history" && (
          <HistoryTab onTabChange={setActiveTab} />
        )}
        {activeTab === "subscribe" && <SubscribeTab />}
      </div>
    </div>
  );
}
