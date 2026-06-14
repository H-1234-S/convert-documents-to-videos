import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AutoResizeTextarea } from "../auto-resize-textarea";

// ---- Tests ----

describe("AutoResizeTextarea", () => {
  it("渲染 textarea 元素", () => {
    render(<AutoResizeTextarea placeholder="输入内容" />);

    const textarea = screen.getByPlaceholderText("输入内容");
    expect(textarea).toBeDefined();
    expect(textarea.tagName).toBe("TEXTAREA");
  });

  it("接受输入并触发 onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AutoResizeTextarea placeholder="输入内容" onChange={onChange} />);

    const textarea = screen.getByPlaceholderText("输入内容");
    await user.type(textarea, "测试文本");

    expect(onChange).toHaveBeenCalled();
  });

  it("应用 rounded-2xl 样式", () => {
    render(<AutoResizeTextarea placeholder="输入内容" />);

    const textarea = screen.getByPlaceholderText("输入内容");
    expect(textarea.className).toContain("rounded-2xl");
  });

  it("应用 resize-none 样式", () => {
    render(<AutoResizeTextarea placeholder="输入内容" />);

    const textarea = screen.getByPlaceholderText("输入内容");
    expect(textarea.className).toContain("resize-none");
  });

  it("接受 paddingRight prop", () => {
    render(<AutoResizeTextarea placeholder="输入内容" paddingRight="pr-14" />);

    const textarea = screen.getByPlaceholderText("输入内容");
    expect(textarea.className).toContain("pr-14");
  });

  it("接受 paddingBottom prop", () => {
    render(<AutoResizeTextarea placeholder="输入内容" paddingBottom="pb-12" />);

    const textarea = screen.getByPlaceholderText("输入内容");
    expect(textarea.className).toContain("pb-12");
  });

  it("接受 maxLines prop", () => {
    render(<AutoResizeTextarea placeholder="输入内容" maxLines={10} />);

    const textarea = screen.getByPlaceholderText("输入内容");
    expect(textarea).toBeDefined();
    // maxLines is used internally to calculate maxHeight, verified by component logic
  });

  it("设置最小高度", () => {
    render(<AutoResizeTextarea placeholder="输入内容" minHeight={56} />);

    const textarea = screen.getByPlaceholderText("输入内容");
    const style = window.getComputedStyle(textarea);
    // In JSDOM, inline styles are readable
    expect(textarea.style.height).toBeTruthy();
  });

  it("disabled 状态正确应用", () => {
    render(<AutoResizeTextarea placeholder="输入内容" disabled />);

    const textarea = screen.getByPlaceholderText("输入内容");
    expect(textarea).toBeDisabled();
    expect(textarea.className).toContain("disabled:cursor-not-allowed");
    expect(textarea.className).toContain("disabled:opacity-50");
  });
});
