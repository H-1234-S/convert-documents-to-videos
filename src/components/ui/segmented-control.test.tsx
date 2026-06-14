import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  SegmentedControl,
  type SegmentedControlOption,
} from "./segmented-control";

describe("SegmentedControl", () => {
  const options: SegmentedControlOption<string>[] = [
    { label: "Option 1", value: "opt1" },
    { label: "Option 2", value: "opt2" },
    { label: "Option 3", value: "opt3" },
  ];

  it("renders all options", () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl options={options} value="opt1" onChange={onChange} />
    );

    expect(screen.getByRole("tab", { name: "Option 1" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Option 2" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Option 3" })).toBeInTheDocument();
  });

  it("marks selected option with aria-selected", () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl options={options} value="opt2" onChange={onChange} />
    );

    expect(screen.getByRole("tab", { name: "Option 1" })).toHaveAttribute(
      "aria-selected",
      "false"
    );
    expect(screen.getByRole("tab", { name: "Option 2" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("tab", { name: "Option 3" })).toHaveAttribute(
      "aria-selected",
      "false"
    );
  });

  it("calls onChange when option is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SegmentedControl options={options} value="opt1" onChange={onChange} />
    );

    await user.click(screen.getByRole("tab", { name: "Option 3" }));

    expect(onChange).toHaveBeenCalledWith("opt3");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("supports keyboard navigation with Enter", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SegmentedControl options={options} value="opt1" onChange={onChange} />
    );

    const option2 = screen.getByRole("tab", { name: "Option 2" });
    option2.focus();
    await user.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith("opt2");
  });

  it("supports keyboard navigation with Space", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SegmentedControl options={options} value="opt1" onChange={onChange} />
    );

    const option3 = screen.getByRole("tab", { name: "Option 3" });
    option3.focus();
    await user.keyboard(" ");

    expect(onChange).toHaveBeenCalledWith("opt3");
  });

  it("supports generic value types - number", () => {
    const numOptions: SegmentedControlOption<number>[] = [
      { label: "One", value: 1 },
      { label: "Two", value: 2 },
    ];
    const onChange = vi.fn();

    render(
      <SegmentedControl options={numOptions} value={1} onChange={onChange} />
    );

    expect(screen.getByRole("tab", { name: "One" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });
});
