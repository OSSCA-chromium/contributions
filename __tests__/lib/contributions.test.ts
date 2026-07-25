import fs from 'fs';
import path from 'path';
import {
  getAllContributions,
  getContributionBySlug,
  getAllContributionSlugs,
  isValidGithubUsername,
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