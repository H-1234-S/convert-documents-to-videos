"use client";

import { UserMenu } from "./UserMenu";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useTheme } from "next-themes";

type Tab = "generate" | "history" | "subscribe";

const TABS = [
  { value: "generate" as const, label: "生成视频" },
  { value: "history" as const, label: "历史记录" },
  { value: "subscribe" as const, label: "订阅升级" },
];

interface AppNavbarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

/**
 * 固定顶部导航栏：极简黑白设计。
 *
 * - 使用 SegmentedControl 组件替代原始 tab 按钮
 * - 移除底部边框，背景无缝过渡
 * - 右侧添加主题切换器和用户菜单
 * - 移动端 375px 适配
 */
export function AppNavbar({ activeTab, onTabChange }: AppNavbarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-20 bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-14 px-6 max-w-7xl mx-auto">
        {/* 左占位，保持 tab 居中 */}
        <div className="w-20" />

        {/* 居中 SegmentedControl */}
        <div className="flex-1 flex justify-center">
          <SegmentedControl
            options={TABS}
            value={activeTab}
            onChange={onTabChange}
          />
        </div>

        {/* 右侧：主题切换 + 用户菜单 */}
        <div className="flex items-center gap-3">
          <AnimatedThemeToggler
            theme={theme as "light" | "dark" | undefined}
            onThemeChange={setTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
