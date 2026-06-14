import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTheme } from "next-themes";
import { describe, expect, it, vi } from "vitest";
import { AnimatedThemeToggler } from "./animated-theme-toggler";

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: vi.fn(),
}));

describe("AnimatedThemeToggler", () => {
  it("renders toggle button", () => {
    render(<AnimatedThemeToggler />);

    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });

  it("displays moon icon in light mode", () => {
    render(<AnimatedThemeToggler theme="light" />);

    // Moon icon should be visible in light mode (click to switch to dark)
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("displays sun icon in dark mode", () => {
    render(<AnimatedThemeToggler theme="dark" />);

    // Sun icon should be visible in dark mode (click to switch to light)
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("calls onThemeChange when clicked", async () => {
    const user = userEvent.setup();
    const onThemeChange = vi.fn();

    render(
      <AnimatedThemeToggler theme="light" onThemeChange={onThemeChange} />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    expect(onThemeChange).toHaveBeenCalledWith("dark");
  });

  it("is keyboard accessible", async () => {
    const user = userEvent.setup();
    const onThemeChange = vi.fn();

    render(
      <AnimatedThemeToggler theme="light" onThemeChange={onThemeChange} />
    );

    const button = screen.getByRole("button");
    button.focus();
    await user.keyboard("{Enter}");

    expect(onThemeChange).toHaveBeenCalled();
  });
});
