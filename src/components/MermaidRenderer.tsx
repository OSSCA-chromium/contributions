"use client";

import { useEffect } from "react";
import type { Mermaid } from "mermaid";

type DiagramBlock = {
  sourceElement: HTMLElement;
  outputElement: HTMLElement;
  definition: string;
};

function showRenderFallback({ sourceElement, outputElement }: DiagramBlock) {
  sourceElement.hidden = false;
  outputElement.textContent =
    "다이어그램을 표시하지 못했습니다. 위 원문을 확인해주세요.";
  outputElement.setAttribute("role", "status");
}

async function renderDiagram(mermaid: Mermaid, diagram: DiagramBlock) {
  if (!diagram.outputElement.isConnected) return;
  try {
    // Mermaid는 같은 ID의 기존 요소를 제거하므로 렌더링마다 새 SVG ID를 사용한다.
    const { svg } = await mermaid.render(
      `mermaid-diagram-${crypto.randomUUID()}`,
      diagram.definition,
    );
    if (!diagram.outputElement.isConnected) return;
    // strict 모드에서 Mermaid가 정화한 SVG만 삽입한다. 원문을 직접 넣으면 이 보안 경계를 우회한다.
    diagram.outputElement.innerHTML = svg;
    diagram.outputElement.removeAttribute("role");
    diagram.sourceElement.hidden = true;
  } catch (error) {
    if (!diagram.outputElement.isConnected) return;
    showRenderFallback(diagram);
    console.error(
      "Mermaid 렌더링 오류:",
      { diagramId: diagram.outputElement.id },
      error,
    );
  }
}

export default function MermaidRenderer({
  containerId,
}: {
  containerId: string;
}) {
  useEffect(() => {
    const container = document.getElementById(containerId);
    const blocks = Array.from(
      container?.querySelectorAll<HTMLElement>("pre > code.language-mermaid") ??
        [],
    );
    if (!blocks.length) return;

    // 실패 시 원문을 표시할 수 있도록 원문과 출력 공간을 분리한다.
    const diagrams = blocks.map((code, index) => {
      const sourceElement = code.parentElement!;
      const outputElement = document.createElement("figure");
      outputElement.id = `${containerId}-diagram-${index + 1}`;
      outputElement.className = "mermaid-diagram not-prose";
      outputElement.setAttribute("aria-label", `다이어그램 ${index + 1}`);
      sourceElement.after(outputElement);
      return {
        sourceElement,
        outputElement,
        definition: code.textContent ?? "",
      };
    });
    const renderAll = async () => {
      const { default: mermaid } = await import("@/lib/mermaid");
      for (const diagram of diagrams) {
        await renderDiagram(mermaid, diagram);
      }
    };

    renderAll().catch((error) => {
      const connected = diagrams.filter(
        ({ outputElement }) => outputElement.isConnected,
      );
      if (!connected.length) return;
      connected.forEach(showRenderFallback);
      console.error("Mermaid 준비 오류:", { containerId }, error);
    });

    return () => {
      // 페이지 이동과 StrictMode 재실행에서 늦게 끝난 결과·중복 출력이 남지 않도록 원상 복구한다.
      diagrams.forEach(({ sourceElement, outputElement }) => {
        sourceElement.hidden = false;
        outputElement.remove();
      });
    };
  }, [containerId]);

  return null;
}
