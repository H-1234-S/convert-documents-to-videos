import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { FadeMask } from "../fade-mask";

// ---- Tests ----

describe("FadeMask", () => {
  it("渲染渐变元素", () => {
    const { container } = render(<FadeMask />);

    const mask = container.querySelector("div");
    expect(mask).toBeDefined();
  });

  it("应用 pointer-events-none", () => {
    const { container } = render(<FadeMask />);

    const mask = container.querySelector("div");
    expect(mask?.className).toContain("pointer-events-none");
  });

  it("定位在右下角（absolute bottom-0 right-0）", () => {
    const { container } = render(<FadeMask />);

    const mask = container.querySelector("div");
    expect(mask?.className).toContain("absolute");
    expect(mask?.className).toContain("bottom-0");
    expect(mask?.className).toContain("right-0");
  });

  it("使用垂直渐变背景（bg-gradient-to-b 从上到下）", () => {
    const { container } = render(<FadeMask />);

    const mask = container.querySelector("div");
    expect(mask?.className).toContain("bg-gradient-to-b");
    expect(mask?.className).toContain("from-transparent");
    expect(mask?.className).toContain("to-background");
  });

  it("设置 z-index 为 10", () => {
    const { container } = render(<FadeMask />);

    const mask = container.querySelector("div");
    expect(mask?.className).toContain("z-10");
  });

  it("有 aria-hidden 属性", () => {
    const { container } = render(<FadeMask />);

    const mask = container.querySelector("div");
    expect(mask?.getAttribute("aria-hidden")).toBe("true");
  });

  it("尺寸为全宽、高度 ~80px（h-20 w-full）", () => {
    const { container } = render(<FadeMask />);

    const mask = container.querySelector("div");
    expect(mask?.className).toContain("h-20");
    expect(mask?.className).toContain("w-full");
  });
});
