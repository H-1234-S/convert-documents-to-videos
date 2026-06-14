import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GenerateTab } from "../GenerateTab";

// ---- Mocks ----

const mockMutate = vi.fn();

vi.mock("@/lib/trpc/client", () => ({
  trpc: {
    project: {
      createAndGenerate: {
        useMutation: ({ onSuccess }: { onSuccess?: () => void; onError?: (err: Error) => void }) => ({
          mutate: (input: unknown) => {
            mockMutate(input);
            // 模拟异步成功
            Promise.resolve().then(() => onSuccess?.());
          },
          isPending: false,
        }),
      },
    },
  },
}));

vi.mock("crypto", () => ({
  randomUUID: () => "550e8400-e29b-41d4-a716-446655440000",
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ---- Tests ----

describe("GenerateTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("空文本时按钮 disabled（IconButton state=disabled）", () => {
    const onTabChange = vi.fn();
    render(<GenerateTab onTabChange={onTabChange} />);

    const btn = screen.getByRole("button", { name: "生成视频" });
    expect(btn).toBeDisabled();
    expect(btn.className).toContain("bg-muted"); // disabled state styling
  });

  it("输入文本后按钮 enabled（IconButton state=ready）", () => {
    const onTabChange = vi.fn();
    render(<GenerateTab onTabChange={onTabChange} />);

    const textarea = screen.getByPlaceholderText(/描述你想生成的视频内容/);
    fireEvent.change(textarea, { target: { value: "测试文本" } });

    const btn = screen.getByRole("button", { name: "生成视频" });
    expect(btn).not.toBeDisabled();
    expect(btn.className).toContain("bg-primary"); // ready state styling
  });

  it("提交后调用 mutate", () => {
    const onTabChange = vi.fn();
    render(<GenerateTab onTabChange={onTabChange} />);

    const textarea = screen.getByPlaceholderText(/描述你想生成的视频内容/);
    fireEvent.change(textarea, { target: { value: "测试文本" } });

    const btn = screen.getByRole("button", { name: "生成视频" });
    fireEvent.click(btn);

    // mutate 被调用
    expect(mockMutate).toHaveBeenCalled();
  });

  it("textarea 使用 AutoResizeTextarea 组件", () => {
    const onTabChange = vi.fn();
    render(<GenerateTab onTabChange={onTabChange} />);

    const textarea = screen.getByPlaceholderText(/描述你想生成的视频内容/);
    expect(textarea).toBeInTheDocument();
    // AutoResizeTextarea renders a textarea element
    expect(textarea.tagName).toBe("TEXTAREA");
  });

  it("按钮定位在输入框内部（absolute positioning）", () => {
    const onTabChange = vi.fn();
    const { container } = render(<GenerateTab onTabChange={onTabChange} />);

    const button = screen.getByRole("button", { name: "生成视频" });
    const buttonContainer = button.parentElement;

    // Button container should have absolute positioning classes
    expect(buttonContainer?.className).toContain("absolute");
    expect(buttonContainer?.className).toContain("bottom-3");
    expect(buttonContainer?.className).toContain("right-3");
  });

  it("渲染 FadeMask 组件", () => {
    const onTabChange = vi.fn();
    const { container } = render(<GenerateTab onTabChange={onTabChange} />);

    // FadeMask should be present (check for gradient and pointer-events-none)
    const fadeMask = container.querySelector(".bg-gradient-to-l.pointer-events-none");
    expect(fadeMask).toBeDefined();
  });

  it("IconButton 有正确的 aria-label", () => {
    const onTabChange = vi.fn();
    render(<GenerateTab onTabChange={onTabChange} />);

    const button = screen.getByRole("button", { name: "生成视频" });
    expect(button.getAttribute("aria-label")).toBe("生成视频");
  });
});
