"use client";

import Link from "next/link";
import { WavyBackground } from "@/components/ui/wavy-background";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

/**
 * Landing 首屏：极简黑白设计，专注品牌展示。
 *
 * - 纯黑背景 + 白色文字
 * - 简洁的登录/注册按钮
 * - 去除所有装饰性元素
 */
export function LandingHero() {
  return (
    <WavyBackground
      waveOpacity={0.4}
      blur={8}
      speed="slow"
      waveWidth={80}
    >
      {/* Auth 入口 */}
      <div className="fixed top-6 right-6 z-20 flex items-center gap-4">
        <AnimatedThemeToggler className="p-2 rounded-lg hover:bg-accent transition-colors text-foreground" />
        <Link href="/login">
          <Button
            variant="ghost"
            size="sm"
            className="text-foreground/90 hover:text-foreground hover:bg-accent/50"
          >
            登录
          </Button>
        </Link>
        <Link href="/signup">
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            注册
          </Button>
        </Link>
      </div>

      {/* 居中品牌展示 */}
      <div className="flex flex-col items-center justify-center gap-6 px-4 text-center">
        <TypingAnimation
          as="h1"
          className="text-7xl md:text-9xl font-bold text-foreground tracking-tighter drop-shadow-sm"
          duration={100}
        >
          Volcano
        </TypingAnimation>
        <TypingAnimation
          as="p"
          words={[
            "AI 驱动的视频生成平台",
            "文档一键转视频",
            "智能微课制作",
          ]}
          className="text-xl md:text-2xl text-muted-foreground font-light tracking-wide"
          duration={70}
          pauseDelay={2500}
          loop
          delay={1500}
        />
      </div>
    </WavyBackground>
  );
}
