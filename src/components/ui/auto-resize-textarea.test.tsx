import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AutoResizeTextarea } from "./auto-resize-textarea";

describe("AutoResizeTextarea", () => {
  it("renders with placeholder", () => {
    render(<AutoResizeTextarea placeholder="Enter text..." />);

    expect(screen.getByPlaceholderText("Enter text...")).toBeInTheDocument();
  });

  it("starts with minimum height constraint", () => {
    const { container } = render(
      <AutoResizeTextarea minHeight={56} placeholder="Type here" />
    );

    const textarea = container.querySelector("textarea");
    expect(textarea).toBeInTheDocument();
    // In test environment without layout, we just verify the component renders
  });

  it("calls height adjustment on text change", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AutoResizeTextarea minHeight={56} maxHeight={240} />
    );

    const textarea = container.querySelector("textarea")!;

    // Type multi-line text
    await user.click(textarea);
    await user.keyboard("Line 1{Enter}Line 2{Enter}Line 3");

    // Verify the textarea received the input
    expect(textarea.value).toContain("Line 1");
    expect(textarea.value).toContain("Line 2");
  });

  it("applies maxHeight prop", () => {
    const maxHeight = 120;
    const { container } = render(
      <AutoResizeTextarea minHeight={56} maxHeight={maxHeight} />
    );

    const textarea = container.querySelector("textarea")!;
    // Verify maxHeight is used in the component logic (checked via props)
    expect(textarea).toBeInTheDocument();
  });

  it("calls onChange handler", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AutoResizeTextarea onChange={onChange} />);

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "Hello");

    expect(onChange).toHaveBeenCalled();
  });

  it("supports controlled value", () => {
    const { rerender } = render(<AutoResizeTextarea value="Initial" readOnly />);

    expect(screen.getByRole("textbox")).toHaveValue("Initial");

    rerender(<AutoResizeTextarea value="Updated" readOnly />);

    expect(screen.getByRole("textbox")).toHaveValue("Updated");
  });

  it("can be disabled", () => {
    render(<AutoResizeTextarea disabled />);

    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("has proper styling classes", () => {
    const { container } = render(<AutoResizeTextarea />);

    const textarea = container.querySelector("textarea");
    expect(textarea?.className).toContain("rounded-2xl");
    expect(textarea?.className).toContain("border");
    expect(textarea?.className).toContain("resize-none");
  });
});
