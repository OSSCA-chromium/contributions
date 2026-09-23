import fs from 'fs';
import path from 'path';
import {
  getAllContributions,
  getContributionBySlug,
  getAllContributionSlugs,
  isValidGithubUsername,
} from '@/lib/contributions';

// Mock only the filesystem so frontmatter is parsed by real gray-matter.
jest.mock('fs');
jest.mock('path');

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
    it('attaches unique direct related slugs from issue, crbug, and explicit review IDs', () => {
      (fs.readdirSync as jest.Mock).mockReturnValue(['123.md', '456.md', '789.md']);
      (fs.readFileSync as jest.Mock).mockImplementation((file: string) => {
        if (file.endsWith('123.md')) {
          return `---\ntitle: First\ndate: 2026-01-01\nauthor: alice\nissue: 12\ncrbug: 34\nrelated: [789, 999, 789]\n---\nFirst body`;
        }
        if (file.endsWith('456.md')) {
          return `---\ntitle: Second\ndate: 2026-01-03\nauthor: bob\nissue: 12\n---\nSecond body`;
        }
        return `---\ntitle: Third\ndate: 2025-12-31\nauthor: carol\ncrbug: 34\n---\nThird body`;
      });

      expect(getAllContributions().map(({ slug, relatedSlugs }) => ({ slug, relatedSlugs }))).toEqual([
        { slug: '456', relatedSlugs: ['123'] },
        { slug: '123', relatedSlugs: ['456', '789'] },
        { slug: '789', relatedSlugs: ['123'] },
      ]);
    });

    it('normalizes legacy and canonical records without changing the upload date', async () => {
      (fs.readdirSync as jest.Mock).mockReturnValue(['123.md', '456.md']);
      (fs.readFileSync as jest.Mock).mockImplementation((file: string) =>
        file.endsWith('123.md')
          ? `---\ntitle: Legacy\ndate: 2025-05-08\nauthor: octocat\ncontribution_url: https://crrev.com/c/123\nlabels: [webrtc]\nstatus: in review\n---\nLegacy body`
          : `---\ntitle: Canonical\ndate: 2025-05-09\nresolvedDate: 2025-05-12\nauthor: hubot\ncontribution_url: https://crrev.com/c/456\nmodule: blink/renderer\nkind: fix\nkeywords: [webrtc, chromium]\nrepo: devtools/devtools-frontend\nissue: 12\ncrbug: 34\nrelated: [123]\nstatus: merged\n---\nCanonical body`
      );

      const [canonical, legacy] = getAllContributions();
      expect(legacy).toMatchObject({
        date: '2025-05-08', status: 'in review', module: '', kind: '',
        keywords: ['webrtc'], labels: ['webrtc'], related: [],
      });
      expect(canonical).toMatchObject({
        date: '2025-05-09', resolvedDate: '2025-05-12', status: 'merged',
        module: 'blink/renderer', kind: 'fix',
        keywords: ['webrtc', 'chromium'], labels: ['webrtc', 'chromium'],
        repo: 'devtools/devtools-frontend', issue: 12, crbug: 34, related: [123],
      });
      expect(await getContributionBySlug('456')).toMatchObject({
        title: canonical.title,
        date: canonical.date,
        status: canonical.status,
        related: canonical.related,
      });
    });

    it('keeps separately supplied labels and keywords in their original order', () => {
      (fs.readdirSync as jest.Mock).mockReturnValue(['123.md']);
      (fs.readFileSync as jest.Mock).mockReturnValue(`---\ntitle: Both aliases\ndate: 2025-05-08\nauthor: octocat\ncontribution_url: https://crrev.com/c/123\nlabels: [legacy, legacy2]\nkeywords: [new, new2]\nstatus: abandoned\n---\nBody`);

      expect(getAllContributions()[0]).toMatchObject({
        labels: ['legacy', 'legacy2'], keywords: ['new', 'new2'], status: 'abandoned',
      });
    });

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
labels: [docs]
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
