import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorState } from "../ErrorState";

// ---- Tests ----

describe("ErrorState", () => {
  it("渲染错误消息 + 重试按钮", () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);

    // 错误消息 (使用部分匹配)
    expect(screen.getByText(/加载失败/)).toBeDefined();

    // 重试按钮
    const btn = screen.getByText("重新加载");
    expect(btn).toBeDefined();
  });

  it("点击重试按钮调用 onRetry", () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);

    fireEvent.click(screen.getByText("重新加载"));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
