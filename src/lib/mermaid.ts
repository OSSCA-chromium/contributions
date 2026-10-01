import mermaid from "mermaid";

// 최초 모듈 로딩 시 한 번 초기화하고, 이후에는 모듈 캐시를 사용한다.
mermaid.initialize({
  startOnLoad: false,
  securityLevel: "strict",
  suppressErrorRendering: true,
  theme: "default",
});

export default mermaid;
