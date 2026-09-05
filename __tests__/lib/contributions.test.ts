import fs from 'fs';
import path from 'path';
import {
  getAllContributions,
  getContributionBySlug,
  getAllContributionSlugs,
  isValidGithubUsername,
  computeRelated,
} from '@/lib/contributions';

// fs 및 path 모듈 모킹
jest.mock('fs');
jest.mock('path');
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

describe('contributions 유틸리티', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // process.cwd() 모킹
    process.cwd = jest.fn().mockReturnValue('/mock/path');
    
    // path.join 모킹
    (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
    
    // 기본적으로 파일 존재 여부 true로 설정
    (fs.existsSync as jest.Mock).mockReturnValue(true);
  });
  
  describe('getAllContributions', () => {
    it.each([
      ['abandoned', 'abandoned'],
      ['draft', undefined],
    ])('%s 상태를 목록과 상세에서 %s로 읽는다', async (status, expected) => {
      (fs.readdirSync as jest.Mock).mockReturnValue(['123.md']);
      (fs.readFileSync as jest.Mock).mockReturnValue(`---
title: Fix docs
date: 2026-09-05
author: octocat
contribution_url: https://crrev.com/c/123
module: docs
kind: fix
status: ${status}
---
Contribution content`);

      expect(getAllContributions()[0].status).toBe(expected);
      expect((await getContributionBySlug('123'))?.status).toBe(expected);
    });

    it('모든 컨트리뷰션을 가져옵니다', () => {
      // 가상의 파일 목록 생성
      (fs.readdirSync as jest.Mock).mockReturnValue(['test1.md', 'test2.md', 'not-a-markdown.txt']);
      
      // 파일 내용 모킹
      (fs.readFileSync as jest.Mock).mockImplementation((path) => {
        if (path.includes('test1.md')) {
          return `---
title: 테스트 컨트리뷰션 1
date: 2025-01-01
author: 홍길동
---
테스트 컨트리뷰션 1 내용`;
        } else if (path.includes('test2.md')) {
          return `---
title: 테스트 컨트리뷰션 2
date: 2025-01-02
author: 김철수
---
테스트 컨트리뷰션 2 내용`;
        }
        return '';
      });
      
      const contributions = getAllContributions();
      
      expect(contributions).toHaveLength(2);
      expect(contributions[0].title).toBe('테스트 컨트리뷰션 2'); // 날짜순으로 정렬되므로 최신이 먼저
      expect(contributions[1].title).toBe('테스트 컨트리뷰션 1');
    });
    
    it('컨트리뷰션 디렉토리가 없으면 빈 배열을 반환합니다', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      
      const contributions = getAllContributions();
      
      expect(contributions).toEqual([]);
      expect(fs.readdirSync).not.toHaveBeenCalled();
    });
    
    it('컨트리뷰션 파일이 없으면 빈 배열을 반환합니다', () => {
      (fs.readdirSync as jest.Mock).mockReturnValue([]);
      
      const contributions = getAllContributions();
      
      expect(contributions).toEqual([]);
    });

    it('module/kind/repo/참조 필드를 파싱합니다', () => {
      (fs.readdirSync as jest.Mock).mockReturnValue(['8146040.md']);
      (fs.readFileSync as jest.Mock).mockReturnValue(`---
title: Fix docs
date: 2026-07-27
author: Yelihi
contribution_url: https://crrev.com/c/8146040
status: merged
module: docs
kind: fix
issue: 42
crbug: 538651940
---
본문`);

      const [c] = getAllContributions();

      expect(c.module).toBe('docs');
      expect(c.kind).toBe('fix');
      expect(c.repo).toBe('chromium/src'); // crrev URL + repo 필드 없음 → 기본값
      expect(c.issue).toBe(42);
      expect(c.crbug).toBe(538651940);
      expect(c.related).toEqual([]);
      expect(c.status).toBe('merged');
    });

    it('full URL에서 repo를 파싱하며 repo 필드보다 우선합니다', () => {
      (fs.readdirSync as jest.Mock).mockReturnValue(['1000.md']);
      (fs.readFileSync as jest.Mock).mockReturnValue(`---
title: t
date: 2026-01-01
author: a
contribution_url: https://chromium-review.googlesource.com/c/devtools/devtools-frontend/+/1000
status: abandoned
module: devtools
kind: fix
repo: wrong/value
---
b`);

      const [c] = getAllContributions();

      expect(c.repo).toBe('devtools/devtools-frontend');
      expect(c.status).toBe('abandoned');
    });

    it('module/kind가 없으면 빈 문자열로 둡니다', () => {
      (fs.readdirSync as jest.Mock).mockReturnValue(['999.md']);
      (fs.readFileSync as jest.Mock).mockReturnValue(`---
title: legacy
date: 2025-01-01
author: a
---
b`);

      const [c] = getAllContributions();

      expect(c.module).toBe('');
      expect(c.kind).toBe('');
      expect(c.repo).toBe('chromium/src');
    });

    it('crrev URL에서는 repo 필드를 사용합니다', () => {
      (fs.readdirSync as jest.Mock).mockReturnValue(['8264335.md']);
      (fs.readFileSync as jest.Mock).mockReturnValue(`---
title: t
date: 2026-08-20
author: a
contribution_url: https://crrev.com/c/8264335
status: merged
module: devtools
kind: refactor
repo: devtools/devtools-frontend
---
b`);

      const [c] = getAllContributions();

      expect(c.repo).toBe('devtools/devtools-frontend');
    });
  });
  
  describe('getContributionBySlug', () => {
    it('슬러그로 컨트리뷰션을 가져옵니다', async () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(`---
title: 테스트 컨트리뷰션
date: 2025-01-01
author: 홍길동
contribution_url: https://example.com
---
테스트 컨트리뷰션 내용`);
      
      const contribution = await getContributionBySlug('test-slug');
      
      expect(contribution).not.toBeNull();
      expect(contribution?.title).toBe('테스트 컨트리뷰션');
      expect(contribution?.author).toBe('홍길동');
      expect(contribution?.contributionUrl).toBe('https://example.com');
      expect(contribution?.contentHtml).toContain('테스트 컨트리뷰션 내용');
    });
    
    it('컨트리뷰션 파일이 없으면 null을 반환합니다', async () => {
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // 디렉토리는 존재
        .mockReturnValueOnce(false); // 파일은 존재하지 않음
      
      const contribution = await getContributionBySlug('non-existent');
      
      expect(contribution).toBeNull();
    });
  });
  
  describe('getAllContributionSlugs', () => {
    it('모든 컨트리뷰션 슬러그를 가져옵니다', () => {
      (fs.readdirSync as jest.Mock).mockReturnValue(['test1.md', 'test2.md', 'not-a-markdown.txt']);
      
      const slugs = getAllContributionSlugs();
      
      expect(slugs).toHaveLength(2);
      expect(slugs[0]).toEqual({ slug: 'test1' });
      expect(slugs[1]).toEqual({ slug: 'test2' });
    });
    
    it('디렉토리가 없으면 빈 배열을 반환합니다', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      
      const slugs = getAllContributionSlugs();

      expect(slugs).toEqual([]);
    });
  });

  describe('isValidGithubUsername', () => {
    it('공백/특수문자를 거릅니다', () => {
      expect(isValidGithubUsername('ppirabbang')).toBe(true);
      expect(isValidGithubUsername('홍 길동')).toBe(false);
      expect(isValidGithubUsername('')).toBe(false);
    });
  });
});

// Pure function — no fs/gray-matter mocking needed, so this lives outside
// the 'contributions 유틸리티' describe block above.
describe('computeRelated', () => {
  const item = (slug: string, extra: Partial<{ issue: number; crbug: number; related: number[] }> = {}) => ({
    slug,
    related: [],
    ...extra,
  });

  it('명시적 related를 양방향으로 연결합니다', () => {
    const map = computeRelated([item('100', { related: [200] }), item('200')]);
    expect(map.get('100')).toEqual(['200']);
    expect(map.get('200')).toEqual(['100']);
  });

  it('같은 issue/crbug를 공유하면 연결합니다', () => {
    const map = computeRelated([
      item('1', { issue: 7 }),
      item('2', { issue: 7 }),
      item('3', { crbug: 99 }),
      item('4', { crbug: 99 }),
      item('5'),
    ]);
    expect(map.get('1')).toEqual(['2']);
    expect(map.get('3')).toEqual(['4']);
    expect(map.get('5')).toEqual([]);
  });

  it('존재하지 않는 related 대상은 생략하고 자기 자신은 제외합니다', () => {
    const map = computeRelated([item('100', { related: [100, 999] })]);
    expect(map.get('100')).toEqual([]);
  });

  it('결과는 입력 순서를 유지하고 중복을 제거합니다', () => {
    const map = computeRelated([
      item('300', { issue: 1 }),
      item('200', { issue: 1, related: [100] }),
      item('100', { issue: 1 }),
    ]);
    // 200: issue 공유(300, 100) + 명시 related(100) → 중복 없이 입력 순서대로
    expect(map.get('200')).toEqual(['300', '100']);
  });
});
