import * as React from "react";
import { StrictMode } from "react";
import { randomUUID } from "node:crypto";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import mermaid from "mermaid";
import ThemeToggle from "@/components/ThemeToggle";

let MermaidRenderer: typeof import("@/components/MermaidRenderer").default;

jest.mock("mermaid", () => ({
  __esModule: true,
  default: { initialize: jest.fn(), render: jest.fn() },
}));

const draw = mermaid.render as jest.Mock;
const initialize = mermaid.initialize as jest.Mock;

function pendingRender() {
  let resolve!: (result: { svg: string }) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<{ svg: string }>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return {
    promise,
    finish: (svg: string) => resolve({ svg }),
    fail: (error: Error) => reject(error),
  };
}

function body(id: string, sources = ["flowchart TD\nA --> B"]) {
  const container = document.createElement("article");
  container.id = id;
  sources.forEach((source) => {
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.className = "hljs language-mermaid";
    code.textContent = source;
    pre.append(code);
    container.append(pre);
  });
  document.body.append(container);
  return container;
}

beforeAll(() => {
  // jsdom에 없는 브라우저 API는 Node의 동일한 UUID 구현으로 보완한다.
  Object.defineProperty(crypto, "randomUUID", { value: randomUUID });
});

beforeEach(async () => {
  // 모듈 캐시는 테스트마다 분리하고 React와 Mermaid 모킹은 공유한다.
  jest.resetModules();
  jest.doMock("react", () => React);
  jest.doMock("mermaid", () => ({ __esModule: true, default: mermaid }));
  ({ default: MermaidRenderer } = await import("@/components/MermaidRenderer"));
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  jest.clearAllMocks();
  draw
    .mockReset()
    .mockResolvedValue({ svg: '<svg role="img"><text>diagram</text></svg>' });
});

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
  jest.restoreAllMocks();
});

test("지정한 본문만 변환하고 StrictMode에서도 중복 SVG 없이 원문을 보존한다", async () => {
  const target = body("target", [
    "flowchart TD\nA --> B",
    "flowchart TD\nC --> D",
  ]);
  const other = body("other");
  const { unmount } = render(
    <StrictMode>
      <MermaidRenderer containerId="target" />
    </StrictMode>,
  );

  await waitFor(() => expect(target.querySelectorAll("svg")).toHaveLength(2));
  expect(initialize).toHaveBeenCalledWith(
    expect.objectContaining({
      securityLevel: "strict",
      startOnLoad: false,
      suppressErrorRendering: true,
      theme: "default",
    }),
  );
  expect(initialize).toHaveBeenCalledTimes(1);
  expect(target.querySelectorAll(".mermaid-diagram")).toHaveLength(2);
  expect(target.querySelector("code")?.textContent).toBe(
    "flowchart TD\nA --> B",
  );
  expect(target.querySelector("pre")).toHaveAttribute("hidden");
  expect(other.querySelector("svg")).toBeNull();
  expect(other.querySelector("pre")).not.toHaveAttribute("hidden");

  unmount();
  expect(target.querySelector(".mermaid-diagram")).toBeNull();
  expect(target.querySelector("pre")).not.toHaveAttribute("hidden");
});

test.each([false, true])(
  "초기 다크 모드 %s에서도 테마 전환 후 같은 SVG를 유지한다",
  async (dark) => {
    document.documentElement.classList.toggle("dark", dark);
    const target = body("target");
    render(
      <>
        <ThemeToggle />
        <MermaidRenderer containerId="target" />
      </>,
    );
    await waitFor(() => expect(target.querySelector("svg")).not.toBeNull());
    const svg = target.querySelector("svg");

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "테마 전환" }));
    });
    expect(document.documentElement.classList.contains("dark")).toBe(!dark);
    expect(target.querySelector("svg")).toBe(svg);
    expect(target.querySelector("pre")).toHaveAttribute("hidden");
    expect(initialize).toHaveBeenCalledTimes(1);
    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({ theme: "default" }),
    );
    expect(draw).toHaveBeenCalledTimes(1);
  },
);

test("한 블록의 실패는 원문과 안내로 표시하고 다음 블록은 렌더링한다", async () => {
  const logError = jest.spyOn(console, "error").mockImplementation(() => {});
  const error = new Error("Invalid diagram");
  draw.mockRejectedValueOnce(error);
  const target = body("target", ["invalid", "flowchart TD\nA --> B"]);
  render(<MermaidRenderer containerId="target" />);

  await waitFor(() => expect(target.querySelector("svg")).not.toBeNull());
  expect(target.querySelector('[role="status"]')).toHaveTextContent(
    "다이어그램을 표시하지 못했습니다",
  );
  expect(target.querySelectorAll("pre")[0]).not.toHaveAttribute("hidden");
  expect(target.querySelectorAll("pre")[1]).toHaveAttribute("hidden");
  expect(logError).toHaveBeenCalledWith(
    "Mermaid 렌더링 오류:",
    { diagramId: "target-diagram-1" },
    error,
  );
});

test("초기화 실패는 본문 원문을 보존하고 문서 식별자와 함께 기록한다", async () => {
  const logError = jest.spyOn(console, "error").mockImplementation(() => {});
  const error = new Error("Initialization failed");
  initialize.mockImplementationOnce(() => {
    throw error;
  });
  const target = body("target");
  render(<MermaidRenderer containerId="target" />);

  await waitFor(() =>
    expect(target.querySelector('[role="status"]')).toHaveTextContent(
      "다이어그램을 표시하지 못했습니다",
    ),
  );
  expect(target.querySelector("pre")).not.toHaveAttribute("hidden");
  expect(target.querySelector("svg")).toBeNull();
  expect(logError).toHaveBeenCalledWith(
    "Mermaid 준비 오류:",
    { containerId: "target" },
    error,
  );
});

test("이전 페이지의 지연된 렌더링은 새 페이지를 변경하지 않는다", async () => {
  const previous = pendingRender();
  const next = pendingRender();
  draw.mockReturnValueOnce(previous.promise).mockReturnValueOnce(next.promise);
  const oldPage = body("old");
  const nextPage = body("next");
  const { rerender } = render(<MermaidRenderer containerId="old" />);
  try {
    await waitFor(() => expect(draw).toHaveBeenCalledTimes(1));
    const oldOutput = oldPage.querySelector(".mermaid-diagram");

    rerender(<MermaidRenderer containerId="next" />);
    await waitFor(() => expect(draw).toHaveBeenCalledTimes(2));
    expect(initialize).toHaveBeenCalledTimes(1);
    expect(draw.mock.calls[0][0]).not.toBe(draw.mock.calls[1][0]);
    await act(async () => previous.finish("<svg>stale</svg>"));
    expect(oldOutput).toBeEmptyDOMElement();
    expect(oldPage.querySelector(".mermaid-diagram")).toBeNull();
    expect(oldPage.querySelector("pre")).not.toHaveAttribute("hidden");
    expect(nextPage.querySelector("svg")).toBeNull();
    expect(nextPage.querySelector("pre")).not.toHaveAttribute("hidden");

    await act(async () => next.finish("<svg>next page</svg>"));
    await waitFor(() =>
      expect(nextPage.querySelector("svg")).toHaveTextContent("next page"),
    );
  } finally {
    await act(async () => {
      previous.finish("<svg />");
      next.finish("<svg />");
    });
  }
});

test.each(["성공", "실패"])(
  "같은 ID로 재진입해도 이전 렌더링의 %s 결과는 무시한다",
  async (result) => {
    const logError = jest.spyOn(console, "error").mockImplementation(() => {});
    const previous = pendingRender();
    const next = pendingRender();
    draw
      .mockReturnValueOnce(previous.promise)
      .mockReturnValueOnce(next.promise);
    const target = body("target");
    const first = render(<MermaidRenderer containerId="target" />);
    try {
      await waitFor(() => expect(draw).toHaveBeenCalledTimes(1));
      const oldOutput = target.querySelector(".mermaid-diagram");
      first.unmount();
      render(<MermaidRenderer containerId="target" />);
      await waitFor(() => expect(draw).toHaveBeenCalledTimes(2));
      const newOutput = target.querySelector(".mermaid-diagram");
      expect(newOutput).not.toBe(oldOutput);
      expect(newOutput?.id).toBe(oldOutput?.id);
      const ids = draw.mock.calls.map(([id]) => id);
      expect(new Set(ids).size).toBe(2);
      expect(ids).toEqual([
        expect.stringMatching(/^mermaid-diagram-[a-f0-9-]+$/),
        expect.stringMatching(/^mermaid-diagram-[a-f0-9-]+$/),
      ]);

      await act(async () => {
        if (result === "실패") previous.fail(new Error("stale render"));
        else previous.finish("<svg>stale</svg>");
      });
      expect(oldOutput).toBeEmptyDOMElement();
      expect(newOutput).toBeEmptyDOMElement();
      expect(target.querySelector("pre")).not.toHaveAttribute("hidden");
      expect(logError).not.toHaveBeenCalled();

      await act(async () => next.finish("<svg>current</svg>"));
      expect(newOutput).toHaveTextContent("current");
      expect(target.querySelector("pre")).toHaveAttribute("hidden");
      expect(initialize).toHaveBeenCalledTimes(1);
    } finally {
      await act(async () => {
        previous.finish("<svg />");
        next.finish("<svg />");
      });
    }
  },
);

test("언마운트 후에는 대기 중이던 결과와 후속 블록을 렌더링하지 않는다", async () => {
  const pending = pendingRender();
  draw.mockReturnValueOnce(pending.promise);
  const target = body("target", [
    "flowchart TD\nA --> B",
    "flowchart TD\nC --> D",
  ]);
  const { unmount } = render(<MermaidRenderer containerId="target" />);
  try {
    await waitFor(() => expect(draw).toHaveBeenCalledTimes(1));
    unmount();
    await act(async () => pending.finish("<svg>stale</svg>"));
    expect(draw).toHaveBeenCalledTimes(1);
    expect(target.querySelector(".mermaid-diagram")).toBeNull();
    expect(target.querySelector("pre[hidden]")).toBeNull();
  } finally {
    await act(async () => pending.finish("<svg />"));
  }
});

test("렌더링 중 테마가 바뀌어도 기본 테마 렌더링을 완료한다", async () => {
  const pending = pendingRender();
  draw.mockReturnValueOnce(pending.promise);
  const target = body("target");
  render(
    <>
      <ThemeToggle />
      <MermaidRenderer containerId="target" />
    </>,
  );
  try {
    await waitFor(() => expect(draw).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole("button", { name: "테마 전환" }));
    await act(async () => pending.finish("<svg>default diagram</svg>"));
    expect(target.querySelector("svg")).toHaveTextContent("default diagram");
    expect(target.querySelector("pre")).toHaveAttribute("hidden");
    expect(initialize).toHaveBeenCalledTimes(1);
    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({ theme: "default" }),
    );
    expect(draw).toHaveBeenCalledTimes(1);
    expect(target.querySelectorAll("svg")).toHaveLength(1);
  } finally {
    await act(async () => pending.finish("<svg />"));
  }
});

test("Mermaid 블록이 없는 본문은 렌더러를 실행하지 않는다", async () => {
  body("empty", []);
  await act(async () => {
    render(<MermaidRenderer containerId="empty" />);
  });
  expect(initialize).not.toHaveBeenCalled();
  expect(draw).not.toHaveBeenCalled();
});
