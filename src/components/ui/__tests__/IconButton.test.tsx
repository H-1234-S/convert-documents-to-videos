import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { IconButton } from "../icon-button";

// ---- Mocks ----

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ---- Tests ----

describe("IconButton", () => {
  it("渲染禁用状态（disabled）", () => {
    const onClick = vi.fn();
    render(<IconButton state="disabled" onClick={onClick} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button.className).toContain("bg-muted");
    expect(button.className).toContain("text-muted-foreground");
  });

  it("渲染就绪状态（ready）", () => {
    const onClick = vi.fn();
    render(<IconButton state="ready" onClick={onClick} />);

    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();
    expect(button.className).toContain("bg-primary");
    expect(button.className).toContain("text-primary-foreground");
  });

  it("渲染加载状态（pending）", () => {
    const onClick = vi.fn();
    render(<IconButton state="pending" onClick={onClick} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button.className).toContain("bg-primary");

    // Loader2 icon should be present
    const loader = button.querySelector(".animate-spin");
    expect(loader).toBeDefined();
  });

  it("按钮有 aria-label", () => {
    const onClick = vi.fn();
    render(<IconButton state="ready" onClick={onClick} aria-label="生成视频" />);

    const button = screen.getByRole("button", { name: "生成视频" });
    expect(button).toBeDefined();
  });

  it("按钮是圆形的（rounded-full）", () => {
    const onClick = vi.fn();
    render(<IconButton state="ready" onClick={onClick} />);

    const button = screen.getByRole("button");
    expect(button.className).toContain("rounded-full");
  });

  it("按钮尺寸为 40x40px（h-10 w-10）", () => {
    const onClick = vi.fn();
    render(<IconButton state="ready" onClick={onClick} />);

    const button = screen.getByRole("button");
    expect(button.className).toContain("h-10");
    expect(button.className).toContain("w-10");
  });
});
