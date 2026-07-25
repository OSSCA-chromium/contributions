import fs from 'fs';
import path from 'path';
import { markdownToHtml, getMarkdownContent, extractHeadings } from '@/lib/markdown';

// fs 및 path 모듈 모킹
jest.mock('fs');
jest.mock('path');
jest.mock('highlight.js', () => ({
  getLanguage: jest.fn().mockImplementation((lang) => lang === 'javascript'),
  highlight: jest.fn().mockImplementation((code, options) => {
    return { value: `<span class="hljs-highlighted">${code}</span>` };
  })
}));

// CSS 파일 모킹 코드 제거 (jest.config.js에서 처리)

jest.mock('gray-matter', () => {
  return jest.fn().mockImplementation((content) => {
    // 간단한 마크다운 파싱 모킹
    const frontmatterMatch = content.match(/---\n([\s\S]*?)\n---\n([\s\S]*)/);
    
    if (frontmatterMatch) {
      try {
        const frontmatterString = frontmatterMatch[1];
        const content = frontmatterMatch[2];
        
        // 기본적인 YAML 파싱 모의
        const frontmatterLines = frontmatterString.split('\n');
        const data: Record<string, string> = {};
        
        frontmatterLines.forEach((line: string) => {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length) {
            data[key.trim()] = valueParts.join(':').trim();
          }
        });
        
        return {
          data,
          content
        };
      } catch (_) {
        // 파싱 오류 시 빈 데이터 반환
        return { data: {}, content: content };
      }
    }
    
    return { data: {}, content };
  });
});

describe('markdown 유틸리티', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // process.cwd() 모킹
    process.cwd = jest.fn().mockReturnValue('/mock/path');
    
    // path.join 모킹
    (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
    
    // 기본적으로 파일 존재 여부 true로 설정
    (fs.existsSync as jest.Mock).mockReturnValue(true);
  });
  
  describe('markdownToHtml', () => {
    it('헤더와 단락을 HTML로 변환합니다', () => {
      const html = markdownToHtml('# 제목\n\n본문 내용');

      expect(html).toContain('<h1');
      expect(html).toContain('제목');
      expect(html).toContain('본문 내용');
    });

    it('헤딩에 slug id를 부여합니다', () => {
      const html = markdownToHtml('# 제목입니다');

      expect(html).toContain('id="제목입니다"');
    });

    it('헤딩의 명시적 앵커({#id})를 id로 쓰고 표시 텍스트에서 제거합니다', () => {
      const html = markdownToHtml('## 부록: CL 푸터 참조 {#cl-footer-reference}');

      expect(html).toContain('id="cl-footer-reference"');
      expect(html).toContain('부록: CL 푸터 참조');
      expect(html).not.toContain('{#cl-footer-reference}');
    });

    it('코드 블록을 변환합니다', () => {
      const markdown = '```javascript\nconst x = 1;\n```';
      const html = markdownToHtml(markdown);

      expect(html).toContain('language-javascript');
      expect(html).toContain('const x = 1;');
      expect(html).toContain('</code></pre>');
    });

    it('기본 리스트를 변환합니다', () => {
      const html = markdownToHtml('- 항목 1\n- 항목 2\n- 항목 3');

      expect(html).toContain('항목 1');
      expect(html).toContain('항목 2');
      expect(html).toContain('항목 3');
    });

    it('순서 있는 리스트를 처리합니다', () => {
      const html = markdownToHtml('1. 첫 번째\n2. 두 번째\n3. 세 번째');

      expect(html).toContain('첫 번째');
      expect(html).toContain('두 번째');
      expect(html).toContain('세 번째');
    });

    it('링크를 HTML로 변환합니다', () => {
      const markdown = '[링크 텍스트](https://example.com)';
      const html = markdownToHtml(markdown);

      expect(html).toContain('href="https://example.com"');
      expect(html).toContain('링크 텍스트');
    });

    it('인라인 코드를 HTML로 변환합니다', () => {
      const markdown = '이것은 `인라인 코드` 입니다.';
      const html = markdownToHtml(markdown);

      expect(html).toContain('<code>인라인 코드</code>');
    });

    it('인용문을 HTML로 변환합니다', () => {
      const markdown = '> 이것은 인용문입니다.';
      const html = markdownToHtml(markdown);

      expect(html).toContain('<blockquote>');
      expect(html).toContain('이것은 인용문입니다.');
      expect(html).toContain('</blockquote>');
    });

    it('강조 및 이탤릭을 HTML로 변환합니다', () => {
      const markdown = '**굵은 텍스트** 그리고 *이탤릭 텍스트*';
      const html = markdownToHtml(markdown);

      expect(html).toContain('<strong>굵은 텍스트</strong>');
      expect(html).toContain('<em>이탤릭 텍스트</em>');
    });

    it('스크립트와 이벤트 핸들러 등 위험한 마크업을 제거합니다', () => {
      const html = markdownToHtml(
        '정상 텍스트 <script>alert(1)</script>\n\n<img src="x" onerror="alert(1)">'
      );

      expect(html).toContain('정상 텍스트');
      expect(html).not.toContain('<script');
      expect(html).not.toContain('onerror');
    });
  });

  describe('extractHeadings', () => {
    it('헤딩 텍스트/레벨/id를 추출합니다', () => {
      const headings = extractHeadings('# A\n\n## B\n\n본문');

      expect(headings).toEqual([
        { id: 'a', text: 'A', level: 1 },
        { id: 'b', text: 'B', level: 2 },
      ]);
    });

    it('코드 블록 내부의 헤딩은 무시합니다', () => {
      const headings = extractHeadings('# 제목\n\n```\n# 코드 안 헤딩\n```\n');

      expect(headings).toEqual([{ id: '제목', text: '제목', level: 1 }]);
    });

    it('명시적 앵커({#id})가 있는 헤딩은 그 id를 사용합니다', () => {
      const headings = extractHeadings('## 코드 리뷰 {#code-review}');

      expect(headings).toEqual([
        { id: 'code-review', text: '코드 리뷰', level: 2 },
      ]);
    });
  });
  
  describe('getMarkdownContent', () => {
    it('마크다운 파일 내용을 가져옵니다', async () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(`---
title: 테스트 문서
date: 2025-01-01
author: 홍길동
---
# 테스트 문서

이것은 테스트 문서입니다.`);
      
      const content = await getMarkdownContent('/test/path.md');
      
      expect(content).not.toBeNull();
      expect(content?.title).toBe('테스트 문서');
      expect(content?.author).toBe('홍길동');
      expect(content?.date).toBe('2025-01-01');
      expect(content?.contentHtml).toContain('테스트 문서');
      expect(content?.contentHtml).toContain('이것은 테스트 문서입니다.');
    });
    
    it('파일이 존재하지 않으면 null을 반환합니다', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      
      const content = await getMarkdownContent('/non-existent.md');
      
      expect(content).toBeNull();
    });
    
    it('프론트매터가 없는 파일도 처리합니다', async () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(`# 프론트매터 없는 문서

이것은 프론트매터가 없는 문서입니다.`);
      
      const content = await getMarkdownContent('/test/no-frontmatter.md');
      
      expect(content).not.toBeNull();
      expect(content?.title).toBe('제목 없음');
      expect(content?.contentHtml).toContain('프론트매터 없는 문서');
    });
    
    it('발췌문(excerpt)을 생성합니다', async () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(`---
title: 발췌문 테스트
---
# 제목입니다

이것은 첫 번째 단락입니다.

이것은 두 번째 단락입니다.`);
      
      const content = await getMarkdownContent('/test/excerpt.md');
      
      // 실제 동작에 맞춰 테스트 내용 수정
      expect(content?.excerpt).toContain('이것은 첫 번째 단락입니다.');
    });
  });
}); 