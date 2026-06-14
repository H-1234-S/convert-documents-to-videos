import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState } from "../EmptyState";

// ---- Tests ----

describe("EmptyState", () => {
  it("渲染 Clapperboard 图标 + 提示文案 + CTA 按钮", () => {
    const onGenerate = vi.fn();
    render(<EmptyState onGenerateClick={onGenerate} />);

    // 提示文案
    expect(screen.getByText("还没有生成视频")).toBeDefined();

    // CTA 按钮
    const btn = screen.getByText("开始生成");
    expect(btn).toBeDefined();
  });

  it("点击 CTA 按钮调用 onGenerateClick", () => {
    const onGenerate = vi.fn();
    render(<EmptyState onGenerateClick={onGenerate} />);

    fireEvent.click(screen.getByText("开始生成"));
    expect(onGenerate).toHaveBeenCalledOnce();
  });
});
