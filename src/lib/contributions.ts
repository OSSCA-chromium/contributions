import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { markdownToHtml } from '@/lib/markdown';
import { isValidGithubUsername } from '@/lib/github';
import type { Contribution, ContributionStatus } from '@/lib/types';

const contributionsDirectory = path.join(process.cwd(), 'data/contributions');

const VALID_STATUSES: ContributionStatus[] = ['in review', 'merged', 'abandoned'];

// frontmatter status를 유니언 타입으로 정규화 (유효하지 않으면 undefined)
function normalizeStatus(value: unknown): ContributionStatus | undefined {
  return VALID_STATUSES.includes(value as ContributionStatus)
    ? (value as ContributionStatus)
    : undefined;
}

export function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  return typeof value === 'string' ? [value] : [];
}

function normalizeDate(value: unknown): string | undefined {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString().slice(0, 10);
  }
  return typeof value === 'string' && value ? value : undefined;
}

function normalizePositiveId(value: unknown): number | undefined {
  return Number.isSafeInteger(value) && (value as number) > 0
    ? value as number
    : undefined;
}

function parseContribution(
  slug: string,
  data: Record<string, unknown>,
  content: string,
  contentHtml?: string
): Contribution {
  const keywords = normalizeStringArray(data.keywords ?? data.labels);
  const labels = normalizeStringArray(data.labels ?? data.keywords);
  const excerpt = content
    .split('\n\n')
    .slice(0, 2)
    .join('\n\n')
    .replace(/^#+\s+.+$/gm, '')
    .substring(0, 160)
    .trim();

  return {
    slug,
    title: typeof data.title === 'string' && data.title ? data.title : '제목 없음',
    date: normalizeDate(data.date) ?? new Date().toISOString().slice(0, 10),
    author: typeof data.author === 'string' && data.author ? data.author : '익명',
    contributionUrl: typeof data.contribution_url === 'string' ? data.contribution_url : '',
    module: typeof data.module === 'string' ? data.module : '',
    kind: typeof data.kind === 'string' ? data.kind : '',
    keywords,
    labels,
    repo: typeof data.repo === 'string' ? data.repo : undefined,
    issue: normalizePositiveId(data.issue),
    crbug: normalizePositiveId(data.crbug),
    related: Array.isArray(data.related)
      ? data.related.map(normalizePositiveId).filter((id): id is number => id !== undefined)
      : [],
    resolvedDate: normalizeDate(data.resolvedDate),
    status: normalizeStatus(data.status),
    excerpt,
    content,
    ...(contentHtml === undefined ? {} : { contentHtml }),
  };
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

        return parseContribution(slug, matterResult.data, matterResult.content);
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

    return parseContribution(slug, matterResult.data, matterResult.content, contentHtml);
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
