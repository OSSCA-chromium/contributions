import fs from 'fs';
import matter from 'gray-matter';
import hljs from 'highlight.js';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import 'highlight.js/styles/atom-one-dark.css';

// Allowlist covering everything the marked + highlight.js pipeline emits
// (heading slug ids, code/pre/span classes, links, tables, task-list inputs).
// Anything else — scripts, event handlers, unknown tags — is stripped.
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'a', 'ul', 'ol', 'li', 'blockquote',
    'code', 'pre', 'span', 'strong', 'em', 'b', 'i', 'del', 's', 'hr', 'br',
    'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'input',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    code: ['class'],
    pre: ['class'],
    span: ['class'],
    img: ['src', 'alt', 'title'],
    input: ['type', 'checked', 'disabled'],
    th: ['colspan', 'rowspan', 'align'],
    td: ['colspan', 'rowspan', 'align'],
    '*': ['id'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
};

// 마크다운 컨텐츠 타입
interface MarkdownContent {
  title: string;
  date: string;
  author: string;
  content: string;
  contentHtml: string;
  excerpt: string;
  contribution_url?: string;
  labels?: string[];
  status?: string;
}

// HTML 이스케이프
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 헤딩 텍스트로부터 slug id 생성
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w가-힣\s-]/g, '')
    .replace(/\s+/g, '-');
}

// 헤딩 끝의 명시적 앵커(`## 제목 {#custom-id}`, gitiles 문법)를 해석한다.
// 반환: { id, text } — 명시 앵커가 있으면 그 id를 쓰고 표시 텍스트에서 제거.
function resolveHeading(raw: string): { id: string; text: string } {
  const explicit = /\{#([^}]+)\}\s*$/.exec(raw);
  if (explicit) {
    const text = raw.replace(/\s*\{#[^}]+\}\s*$/, '').trim();
    const id = explicit[1].trim().replace(/[^\w가-힣-]/g, '');
    return { id, text };
  }
  return { id: slugify(raw), text: raw.trim() };
}

// marked 설정 (단일 파이프라인). 코드 하이라이팅 + 헤딩 slug id.
marked.use({
  gfm: true,
  breaks: true,
  async: false,
  renderer: {
    code({ text, lang }) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          const highlighted = hljs.highlight(text, { language: lang }).value;
          return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
        } catch (err) {
          console.error('코드 하이라이팅 오류:', err);
        }
      }
      return `<pre><code class="hljs language-plaintext">${escapeHtml(text)}</code></pre>`;
    },
    heading({ tokens, depth }) {
      let text = this.parser.parseInline(tokens);
      const raw = tokens.map((t) => ('text' in t ? t.text : '')).join('');
      const { id } = resolveHeading(raw);
      // Strip the explicit-anchor marker from the rendered text as well.
      text = text.replace(/\s*\{#[^}]+\}\s*$/, '');
      return `<h${depth} id="${id}">${text}</h${depth}>`;
    },
  },
});

// 마크다운을 HTML로 변환 (마지막에 항상 sanitize)
function markdownToHtml(markdown: string): string {
  let html: string;
  if (markdown.startsWith('<') && markdown.includes('</')) {
    html = markdown;
  } else {
    try {
      html = marked.parse(markdown) as string;
    } catch (error) {
      console.error('마크다운 변환 중 오류:', error);
      html = `<p>${escapeHtml(markdown)}</p>`;
    }
  }
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}

// 마크다운에서 헤딩 목록(목차)을 추출
function extractHeadings(
  markdown: string
): { id: string; text: string; level: number }[] {
  const lines = markdown.split('\n');
  const headings: { id: string; text: string; level: number }[] = [];
  let inCode = false;
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    const m = /^(#{1,6})\s+(.+)$/.exec(line);
    if (m) {
      const { id, text } = resolveHeading(m[2]);
      headings.push({ id, text, level: m[1].length });
    }
  }
  return headings;
}

// 마크다운 파일 읽기
async function getMarkdownContent(filePath: string): Promise<MarkdownContent | null> {
  try {
    if (!fs.existsSync(filePath)) {
      console.error('파일을 찾을 수 없습니다:', filePath);
      return null;
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const matterResult = matter(fileContents);

    const contentHtml = markdownToHtml(matterResult.content);
    const excerpt =
      matterResult.content
        .split('\n\n')
        .slice(0, 2)
        .join('\n\n')
        .replace(/^#+\s+.+$/gm, '')
        .substring(0, 160)
        .trim() + '...';

    return {
      title: matterResult.data.title || '제목 없음',
      date: matterResult.data.date || new Date().toISOString(),
      author: matterResult.data.author || '익명',
      content: matterResult.content,
      contentHtml,
      excerpt,
      contribution_url: matterResult.data.contribution_url,
      labels: matterResult.data.labels,
      status: matterResult.data.status,
    };
  } catch (error) {
    console.error('마크다운 데이터 가져오기 오류:', error);
    return null;
  }
}

export { markdownToHtml, getMarkdownContent, extractHeadings, type MarkdownContent };
