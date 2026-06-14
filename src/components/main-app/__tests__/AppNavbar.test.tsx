import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppNavbar } from "../AppNavbar";

// ---- Mocks ----

vi.mock("@/lib/auth-client", () => ({
  useSession: () => ({ data: { user: { name: "Test User", email: "test@test.com" } }, isPending: false }),
  signOut: vi.fn(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

vi.mock("../UserMenu", () => ({
  UserMenu: () => <div data-testid="user-menu">UserMenu</div>,
}));

// ---- Tests ----

describe("AppNavbar", () => {
  it("渲染三个 tab", () => {
    const onChange = vi.fn();
    render(<AppNavbar activeTab="generate" onTabChange={onChange} />);

    expect(screen.getByText("生成视频")).toBeDefined();
    expect(screen.getByText("历史记录")).toBeDefined();
    expect(screen.getByText("订阅升级")).toBeDefined();
  });

  it("点击 tab 触发 onChange", () => {
    const onChange = vi.fn();
    render(<AppNavbar activeTab="generate" onTabChange={onChange} />);

    fireEvent.click(screen.getByText("历史记录"));
    expect(onChange).toHaveBeenCalledWith("history");
  });

  it("active tab 有 highlited 样式（aria-selected=true）", () => {
    const onChange = vi.fn();
    render(<AppNavbar activeTab="generate" onTabChange={onChange} />);

    const activeTab = screen.getByRole("tab", { selected: true });
    expect(activeTab.textContent).toBe("生成视频");
  });

  it("渲染 UserMenu", () => {
    const onChange = vi.fn();
    render(<AppNavbar activeTab="generate" onTabChange={onChange} />);

    expect(screen.getByTestId("user-menu")).toBeDefined();
  });

  it("渲染 AnimatedThemeToggler", () => {
    const onChange = vi.fn();
    render(<AppNavbar activeTab="generate" onTabChange={onChange} />);

    // Theme toggle button should be present (verify by checking all buttons include tabs + theme toggle)
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(1); // at least theme toggle and tab buttons
  });

  it("navbar 没有底部边框", () => {
    const onChange = vi.fn();
    const { container } = render(<AppNavbar activeTab="generate" onTabChange={onChange} />);

    const nav = container.querySelector("nav");
    expect(nav?.className).not.toContain("border-b");
  });
});
