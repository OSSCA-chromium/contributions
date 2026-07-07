// 로컬 번역 폴더의 Chromium 문서 한국어 전체 번역을 data/docs/로 변환한다.
//
// 사용법 (번역 폴더 경로는 인자 또는 환경변수로 전달):
//   node scripts/sync-chromium-docs.js <translations-dir>
//   CHROMIUM_DOCS_DIR=<translations-dir> node scripts/sync-chromium-docs.js
//
// 변환 규칙:
// - 사이트용 frontmatter(title/order/group/description) 부여, 원본 추적용
//   source_path/source_sha256/translation_status는 유지
// - 본문 첫 `# 제목`은 페이지 H1과 중복되므로 제거, `[TOC]`도 제거
// - 본문 맨 위에 googlesource 원문 링크 인용구 추가
// - 저장소 내부 상대/절대 링크는 googlesource 절대 URL로, 이미지는
//   raw.githubusercontent URL로 재작성 (사이트에서 원본 경로는 404이므로)
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const GS_BASE = 'https://chromium.googlesource.com/chromium/src/+/main/';
const RAW_BASE = 'https://raw.githubusercontent.com/chromium/chromium/main/';

// 사이드바 그룹은 원본 폴더에서 자동 도출한다. 깊은 경로는 대표 폴더로 줄인다.
function groupFor(sourcePath) {
  let dir = path.posix.dirname(sourcePath);
  if (dir === '.') dir = '/'; // 저장소 루트 문서 (예: CODE_OF_CONDUCT.md)
  else if (dir.startsWith('third_party/blink')) dir = 'third_party/blink';
  else if (dir.startsWith('agents')) dir = 'agents';
  return `번역 · ${dir}`;
}

// order는 같은 그룹(원본 폴더)끼리 연속되게 부여한다 — 사이드바 그룹 순서는
// order로 정렬된 문서의 등장 순서를 따르기 때문. title을 지정하면 원문 H1
// 대신 사용한다(사이드바에 담기 좋게 짧은 제목이 필요할 때).
const MANIFEST = [
  // docs/
  { file: 'Chromium - Chromium Docs README.md', slug: 'docs-readme', order: 20, description: 'Chromium 공식 문서 개요와 목차' },
  { file: 'Chromium - Contributing to Chromium.md', slug: 'contributing', order: 21, description: '기여 절차 공식 문서 전체 번역' },
  { file: 'Chromium - Code Reviews.md', slug: 'code-reviews', order: 22, description: '코드 리뷰 정책과 OWNERS 제도' },
  { file: 'Chromium - Respectful Changes.md', slug: 'cl-respect', order: 23, description: 'CL 작성자를 위한 리뷰 예절' },
  { file: 'Chromium - Respectful Code Reviews.md', slug: 'cr-respect', order: 24, description: '리뷰어를 위한 리뷰 예절' },
  { file: 'Chromium - CL Tips.md', slug: 'cl-tips', order: 25, title: 'CL 팁', description: '생산적인 코드 리뷰를 위한 CL 팁' },
  { file: 'Chromium - Commit Checklist.md', slug: 'commit-checklist', order: 26, title: '커밋 체크리스트', description: 'CL 작성부터 머지까지 커밋 체크리스트' },
  { file: 'Chromium - Gerrit Guide.md', slug: 'gerrit-guide', order: 27, description: 'Gerrit 계정 설정과 사용법' },
  { file: 'Chromium - Mac Build Instructions.md', slug: 'mac-build-instructions', order: 28, title: 'Mac 빌드 안내', description: 'Mac에서 체크아웃·빌드하기' },
  { file: 'Chromium - Threading and Tasks in Chrome.md', slug: 'threading-and-tasks', order: 29, description: 'Chrome의 스레딩 모델과 태스크 실행' },
  { file: 'Chromium - Intro to Mojo and Services.md', slug: 'mojo-and-services', order: 30, description: 'Mojo IPC와 서비스 아키텍처 입문' },
  { file: 'Chromium - Configuration - Prefs, Settings, Features, Switches & Flags.md', slug: 'configuration', order: 31, originalTitle: 'Configuration: Prefs, Settings, Features, Switches & Flags', description: 'Prefs·Settings·Features·Switches·Flags 구분' },
  { file: 'Chromium - Integrating a feature with the Origin Trials framework.md', slug: 'origin-trials-integration', order: 32, title: 'Origin Trials 통합', description: '기능을 Origin Trials와 통합하는 방법' },
  // docs/linux/
  { file: 'Chromium - Linux Build Instructions.md', slug: 'linux-build-instructions', order: 33, title: 'Linux 빌드 안내', description: 'Linux에서 체크아웃·빌드하기' },
  // docs/process/
  { file: 'Chromium - Chromium Release Cycle.md', slug: 'release-cycle', order: 34, description: 'Chrome 4주 릴리스 주기' },
  // docs/testing/
  { file: 'Chromium - Web Platform Tests.md', slug: 'web-platform-tests', order: 35, title: 'Web Platform Tests', description: 'WPT 개요와 Chromium에서의 사용' },
  { file: 'Chromium - Writing Web Tests.md', slug: 'writing-web-tests', order: 36, description: '웹 테스트 작성 방법' },
  { file: 'Chromium - Running and Debugging Web Tests.md', slug: 'running-web-tests', order: 37, title: '웹 테스트 실행과 디버깅', description: '웹 테스트 실행과 디버깅 방법' },
  // agents/
  { file: 'Chromium - Chromium Coding Agents.md', slug: 'coding-agents', order: 38, description: 'Chromium 코딩 에이전트 개요' },
  { file: 'Chromium - Chromium AI Coding Policy.md', slug: 'ai-coding-policy', order: 39, description: 'Chromium의 AI 도구 사용 정책' },
  { file: 'Chromium - Blink Spec MCP Server.md', slug: 'blink-spec-mcp', order: 40, description: 'Blink 스펙 MCP 서버 사용법' },
  // third_party/blink/
  { file: 'Chromium - Runtime Enabled Features.md', slug: 'runtime-enabled-features', order: 41, description: 'Blink 런타임 기능 플래그 시스템' },
  // 저장소 루트
  { file: 'Chromium - Chromium Code of Conduct.md', slug: 'code-of-conduct', order: 42, description: 'Chromium 커뮤니티 행동 강령' },
];

// 저장소 내부 링크 대상을 chromium/src 루트 기준 경로로 정규화한다.
// 외부 URL·앵커·메일 링크는 null을 반환해 그대로 둔다.
function repoRootPath(target, sourcePath) {
  if (/^(https?:|mailto:|#)/.test(target)) return null;
  const [file, anchor] = target.split('#');
  if (!file) return null; // 순수 앵커
  const resolved = file.startsWith('/')
    ? file.slice(1)
    : path.posix.normalize(
        path.posix.join(path.posix.dirname(sourcePath), file)
      );
  if (resolved.startsWith('..')) return null; // 저장소 밖 — 손대지 않음
  return anchor ? `${resolved}#${anchor}` : resolved;
}

// 마크다운 링크/이미지의 저장소 내부 경로를 절대 URL로 재작성한다.
function rewriteRepoLinks(body, sourcePath) {
  return body.replace(
    /(!?)\[([^\]]*)\]\(([^)\s]+)\)/g,
    (whole, bang, text, target) => {
      const rooted = repoRootPath(target, sourcePath);
      if (!rooted) return whole;
      const base = bang ? RAW_BASE : GS_BASE;
      return `${bang}[${text}](${base}${rooted})`;
    }
  );
}

function convert(sourceDir, entry) {
  const raw = fs.readFileSync(path.join(sourceDir, entry.file), 'utf8');
  const parsed = matter(raw);
  const sourcePath = parsed.data.source_path;
  if (!sourcePath) throw new Error(`source_path 없음: ${entry.file}`);

  let body = parsed.content;

  // 첫 H1은 frontmatter title로 승격하고 본문에서 제거 (H1 중복 방지)
  const h1 = /^#\s+(.+)$/m.exec(body);
  const title = entry.title || (h1 ? h1[1].trim() : entry.slug);
  if (h1) body = body.replace(h1[0], '');

  body = body
    .split('\n')
    .filter((line) => line.trim() !== '[TOC]')
    .join('\n')
    .trim();

  body = rewriteRepoLinks(body, sourcePath);

  // 원문 제목은 원본 파일명("Chromium - <원제>.md")에서 얻는다 — 번역
  // 제목과 나란히 보여 어떤 문서의 번역인지 비교할 수 있게 한다. 파일명에
  // 못 쓰는 문자(: 등)가 원제에 있으면 manifest의 originalTitle로 지정한다.
  const originalTitle =
    entry.originalTitle ||
    entry.file.replace(/^Chromium - /, '').replace(/\.md$/, '');
  const header =
    `> 이 문서는 **${originalTitle}**([\`${sourcePath}\`](${GS_BASE}${sourcePath})) ` +
    '문서의 한국어 전체 번역입니다.';

  const frontmatter = matter.stringify(`${header}\n\n${body}\n`, {
    title,
    order: entry.order,
    group: groupFor(sourcePath),
    description: entry.description,
    source_path: sourcePath,
    source_sha256: parsed.data.source_sha256 || '',
    translation_status: parsed.data.translation_status || 'full',
  });

  return frontmatter;
}

function main() {
  const sourceDir = process.argv[2] || process.env.CHROMIUM_DOCS_DIR;
  if (!sourceDir) {
    console.error(
      '번역 폴더 경로를 인자 또는 CHROMIUM_DOCS_DIR 환경변수로 전달하세요.\n' +
        '  node scripts/sync-chromium-docs.js <translations-dir>'
    );
    process.exit(1);
  }
  if (!fs.existsSync(sourceDir)) {
    console.error(`번역 폴더를 찾을 수 없습니다: ${sourceDir}`);
    process.exit(1);
  }

  const outDir = path.join(process.cwd(), 'data/docs');
  let count = 0;
  for (const entry of MANIFEST) {
    const output = convert(sourceDir, entry);
    fs.writeFileSync(path.join(outDir, `${entry.slug}.md`), output);
    count += 1;
    console.log(`✓ ${entry.slug}.md`);
  }
  console.log(`${count}개 번역 문서를 data/docs/에 동기화했습니다.`);
}

main();
