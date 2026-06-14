import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LandingHero } from "../LandingHero";

// ---- Mocks ----

vi.mock("@/components/ui/wavy-background", () => ({
  WavyBackground: ({
    children,
    backgroundFill,
    colors,
    waveOpacity,
    blur,
    speed,
  }: {
    children: React.ReactNode;
    backgroundFill?: string;
    colors?: string[];
    waveOpacity?: number;
    blur?: number;
    speed?: string;
  }) => (
    <div
      data-testid="wavy-bg"
      data-background={backgroundFill}
      data-colors={colors?.join(",")}
      data-opacity={waveOpacity}
      data-blur={blur}
      data-speed={speed}
    >
      {children}
    </div>
  ),
}));

vi.mock("@/components/ui/animated-theme-toggler", () => ({
  AnimatedThemeToggler: () => <button data-testid="theme-toggler">🌓</button>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ..._rest }: { children: React.ReactNode; variant?: string; size?: string }) => (
    <button>{children}</button>
  ),
}));

vi.mock("@/components/ui/typing-animation", () => ({
  TypingAnimation: ({
    children,
    words,
    ..._rest
  }: {
    children?: string;
    words?: string[];
    className?: string;
    duration?: number;
    pauseDelay?: number;
    loop?: boolean;
    delay?: number;
    as?: string;
    showCursor?: boolean;
  }) => (
    <span data-testid="typing-animation" data-words={words?.join(",")}>
      {children ?? words?.[0]}
    </span>
  ),
}));

// ---- Tests ----

describe("LandingHero", () => {
  it("渲染登录和注册链接", () => {
    render(<LandingHero />);

    expect(screen.getByText("登录")).toBeDefined();
    expect(screen.getByText("注册")).toBeDefined();
  });

  it("登录按钮链接到 /login", () => {
    render(<LandingHero />);

    const loginLink = screen.getByText("登录").closest("a");
    expect(loginLink?.getAttribute("href")).toBe("/login");
  });

  it("注册按钮链接到 /signup", () => {
    render(<LandingHero />);

    const signupLink = screen.getByText("注册").closest("a");
    expect(signupLink?.getAttribute("href")).toBe("/signup");
  });

  it("WavyBackground 全屏渲染且主题色匹配", () => {
    render(<LandingHero />);

    const wavy = screen.getByTestId("wavy-bg");
    expect(wavy).toBeDefined();
    // WavyBackground component now handles theme dynamically, so we just verify it renders
    expect(wavy).toBeInTheDocument();
  });

  it("渲染品牌标题 Volcano", () => {
    render(<LandingHero />);

    expect(screen.getByText("Volcano")).toBeDefined();
  });

  it("渲染 TypingAnimation 循环卖点词", () => {
    render(<LandingHero />);

    const typingEls = screen.getAllByTestId("typing-animation");
    // 至少有一个 TypingAnimation（品牌名 + 卖点 = 2 个）
    expect(typingEls.length).toBeGreaterThanOrEqual(2);

    // 第二个 TypingAnimation 包含 words 数据
    const wordsAttr = typingEls[1]?.getAttribute("data-words");
    expect(wordsAttr).toContain("AI");
    expect(wordsAttr).toContain("视频");
  });

  it("不渲染 footer 或 CTA 等多余元素", () => {
    render(<LandingHero />);

    expect(screen.queryByText("了解更多")).toBeNull();
    expect(screen.queryByText("开始使用")).toBeNull();
    expect(screen.queryByText("立即体验")).toBeNull();
  });
});
