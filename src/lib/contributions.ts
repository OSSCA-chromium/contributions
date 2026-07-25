import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { markdownToHtml } from '@/lib/markdown';
import { isValidGithubUsername } from '@/lib/github';
import type { Contribution, ContributionStatus } from '@/lib/types';

const contributionsDirectory = path.join(process.cwd(), 'data/contributions');

const VALID_STATUSES: ContributionStatus[] = ['in review', 'merged', 'draft'];

// frontmatter status를 유니언 타입으로 정규화 (유효하지 않으면 undefined)
function normalizeStatus(value: unknown): ContributionStatus | undefined {
  return VALID_STATUSES.includes(value as ContributionStatus)
    ? (value as ContributionStatus)
    : undefined;
}

// frontmatter labels를 string[]으로 정규화
function normalizeLabels(value: unknown): string[] {
  if (Array.isArray(value)) return value;
  if (value) return [value as string];
  return [];
}

export type { Contribution };

// 하위 호환을 위해 @/lib/contributions 에서도 계속 export
export { isValidGithubUsername };

// 컨트리뷰션 폴더가 없으면 생성
try {
  if (!fs.existsSync(contributionsDirectory)) {
    fs.mkdirSync(contributionsDirectory, { recursive: true });
  }
} catch (error) {
  console.error('Error creating directory:', error);
}

// 모든 컨트리뷰션 데이터 가져오기
export function getAllContributions(): Contribution[] {
  try {
    if (!fs.existsSync(contributionsDirectory)) {
      return [];
    }

    const fileNames = fs.readdirSync(contributionsDirectory);
    
    // template.md 파일은 제외
    const contributions = fileNames
      .filter(fileName => fileName.endsWith('.md') && fileName !== 'template.md')
      .map(fileName => {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(contributionsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const matterResult = matter(fileContents);

        // 첫 두 문단 정도를 발췌문으로 사용
        const excerpt = matterResult.content
          .split('\n\n')
          .slice(0, 2)
          .join('\n\n')
          .replace(/^#+\s+.+$/gm, '') // 헤더 제거
          .substring(0, 160)
          .trim();

        return {
          slug,
          title: matterResult.data.title || '제목 없음',
          date: matterResult.data.date || new Date().toISOString(),
          author: matterResult.data.author || '익명',
          contributionUrl: matterResult.data.contribution_url || '',
          labels: normalizeLabels(matterResult.data.labels),
          status: normalizeStatus(matterResult.data.status),
          excerpt: excerpt,
          content: matterResult.content,
        };
      });

    // 날짜순 정렬 (최신순)
    return contributions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error getting contributions:', error);
    return [];
  }
}

// 특정 컨트리뷰션 데이터 가져오기
export async function getContributionBySlug(slug: string): Promise<Contribution | null> {
  try {
    if (!fs.existsSync(contributionsDirectory)) {
      return null;
    }

    const fullPath = path.join(contributionsDirectory, `${slug}.md`);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    // 마크다운을 HTML로 변환 (단일 파이프라인)
    const contentHtml = markdownToHtml(matterResult.content);

    // 첫 두 문단 정도를 발췌문으로 사용
    const excerpt = matterResult.content
      .split('\n\n')
      .slice(0, 2)
      .join('\n\n')
      .replace(/^#+\s+.+$/gm, '') // 헤더 제거
      .substring(0, 160)
      .trim();

    return {
      slug,
      title: matterResult.data.title || '제목 없음',
      date: matterResult.data.date || new Date().toISOString(),
      author: matterResult.data.author || '익명',
      contributionUrl: matterResult.data.contribution_url || '',
      labels: normalizeLabels(matterResult.data.labels),
      status: normalizeStatus(matterResult.data.status),
      excerpt: excerpt,
      content: matterResult.content,
      contentHtml,
    };
  } catch (error) {
    console.error('Error getting contribution:', error);
    return null;
  }
}

// 모든 컨트리뷰션 슬러그 가져오기
export function getAllContributionSlugs(): { slug: string }[] {
  try {
    if (!fs.existsSync(contributionsDirectory)) {
      return [];
    }

    const fileNames = fs.readdirSync(contributionsDirectory);

    return fileNames
      .filter(fileName => fileName.endsWith('.md') && fileName !== 'template.md')
      .map(fileName => {
        return {
          slug: fileName.replace(/\.md$/, '')
        };
      });
  } catch (error) {
    console.error('Error getting contribution slugs:', error);
    return [];
  }
}

// 고유한 컨트리뷰터 목록 가져오기
export function getUniqueContributors(): { username: string; isValidGithubUser: boolean }[] {
  const contributions = getAllContributions();
  const contributors = new Map<string, boolean>();
  
  contributions.forEach(contribution => {
    if (contribution.author) {
      const isValidUser = isValidGithubUsername(contribution.author);
      contributors.set(contribution.author, isValidUser);
    }
  });
  
  return Array.from(contributors.entries()).map(([username, isValidGithubUser]) => ({
    username,
    isValidGithubUser
  }));
} 