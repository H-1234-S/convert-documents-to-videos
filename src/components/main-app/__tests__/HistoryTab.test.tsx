import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { HistoryTab } from "../HistoryTab";

// ---- Mocks ----

const mockRefetch = vi.fn();

vi.mock("@/trpc/client", () => ({
  useTRPC: () => ({
    project: {
      list: {
        queryOptions: (_input?: unknown, _opts?: unknown) => ({
          queryKey: [["project", "list"]],
          queryFn: () => ({
            items: [],
            nextCursor: null,
            total: 0,
          }),
        }),
      },
      delete: {
        mutationOptions: (opts?: Record<string, unknown>) => ({
          mutationKey: [["project", "delete"]],
          mutationFn: vi.fn(),
          ...opts,
        }),
      },
      retry: {
        mutationOptions: (opts?: Record<string, unknown>) => ({
          mutationKey: [["project", "retry"]],
          mutationFn: vi.fn(),
          ...opts,
        }),
      },
    },
  }),
}));

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: (_opts: unknown) => ({
      data: { items: [], nextCursor: null, total: 0 },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    }),
  };
});

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("../HistoryCardActions", () => ({
  HistoryCardActions: ({ project }: { project: { id: string } }) => (
    <div data-testid={`actions-${project.id}`}>Actions</div>
  ),
}));

// ---- Tests ----

describe("HistoryTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("空列表显示 EmptyState", () => {
    const onTabChange = vi.fn();
    render(<HistoryTab onTabChange={onTabChange} />);

    expect(screen.getByText("还没有生成视频")).toBeDefined();
    expect(screen.getByText("开始生成")).toBeDefined();
  });

  it("点击开始生成调用 onTabChange(\"generate\")", () => {
    const onTabChange = vi.fn();
    render(<HistoryTab onTabChange={onTabChange} />);

    screen.getByText("开始生成").click();
    expect(onTabChange).toHaveBeenCalledWith("generate");
  });
});
