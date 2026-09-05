import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { markdownToHtml } from '@/lib/markdown';
import { isValidGithubUsername } from '@/lib/github';
import type { Contribution, ContributionStatus } from '@/lib/types';

const contributionsDirectory = path.join(process.cwd(), 'data/contributions');

const VALID_STATUSES: ContributionStatus[] = ['merged', 'abandoned', 'in review'];

// frontmatter status를 유니언 타입으로 정규화 (유효하지 않으면 undefined)
function normalizeStatus(value: unknown): ContributionStatus | undefined {
  return VALID_STATUSES.includes(value as ContributionStatus)
    ? (value as ContributionStatus)
    : undefined;
}

const GERRIT_PROJECT_RE =
  /^https:\/\/chromium-review\.googlesource\.com\/c\/(.+?)\/\+\/\d+/;

// A full Gerrit URL is the source of truth for the project; the optional
// `repo` frontmatter only covers short crrev.com URLs.
function resolveRepo(url: string, repoField: unknown): string {
  const m = GERRIT_PROJECT_RE.exec(url);
  if (m) return m[1];
  if (typeof repoField === 'string' && repoField.trim() !== '') {
    return repoField.trim();
  }
  return 'chromium/src';
}

function normalizePositiveInt(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

function normalizeRelated(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);
}

function normalizeAxis(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

// Related set = explicit `related` (bidirectional) ∪ shared issue ∪ shared
// crbug. Direct links only — no transitive closure (per spec). Targets that
// have no file yet are silently dropped so a patch can reference its pair
// before the pair is written.
export function computeRelated(
  items: Pick<Contribution, 'slug' | 'issue' | 'crbug' | 'related'>[]
): Map<string, string[]> {
  const known = new Set(items.map((i) => i.slug));
  const links = new Map<string, Set<string>>();
  const link = (a: string, b: string) => {
    if (a === b || !known.has(a) || !known.has(b)) return;
    (links.get(a) ?? links.set(a, new Set()).get(a)!).add(b);
    (links.get(b) ?? links.set(b, new Set()).get(b)!).add(a);
  };

  const byIssue = new Map<number, string[]>();
  const byCrbug = new Map<number, string[]>();
  for (const i of items) {
    for (const id of i.related) link(i.slug, String(id));
    if (i.issue !== undefined) byIssue.set(i.issue, [...(byIssue.get(i.issue) ?? []), i.slug]);
    if (i.crbug !== undefined) byCrbug.set(i.crbug, [...(byCrbug.get(i.crbug) ?? []), i.slug]);
  }
  for (const group of [...byIssue.values(), ...byCrbug.values()]) {
    for (const a of group) for (const b of group) link(a, b);
  }

  const order = new Map(items.map((i, idx) => [i.slug, idx]));
  return new Map(
    items.map((i) => [
      i.slug,
      [...(links.get(i.slug) ?? [])].sort((a, b) => order.get(a)! - order.get(b)!),
    ])
  );
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

        // `module` would shadow the CJS module-scope identifier after
        // transpilation, so the locals carry an Axis suffix.
        const moduleAxis = normalizeAxis(matterResult.data.module);
        const kindAxis = normalizeAxis(matterResult.data.kind);
        const contributionUrl = matterResult.data.contribution_url || '';

        return {
          slug,
          title: matterResult.data.title || '제목 없음',
          date: matterResult.data.date || new Date().toISOString(),
          author: matterResult.data.author || '익명',
          contributionUrl,
          module: moduleAxis,
          kind: kindAxis,
          repo: resolveRepo(contributionUrl, matterResult.data.repo),
          issue: normalizePositiveInt(matterResult.data.issue),
          crbug: normalizePositiveInt(matterResult.data.crbug),
          related: normalizeRelated(matterResult.data.related),
          relatedSlugs: [],
          status: normalizeStatus(matterResult.data.status),
          excerpt,
          content: matterResult.content,
        };
      });

    // 날짜순 정렬 (최신순) 후 연관 패치 계산
    const sorted = contributions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const relatedMap = computeRelated(sorted);
    return sorted.map((c) => ({ ...c, relatedSlugs: relatedMap.get(c.slug) ?? [] }));
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

    // `module` would shadow the CJS module-scope identifier after
    // transpilation, so the locals carry an Axis suffix.
    const moduleAxis = normalizeAxis(matterResult.data.module);
    const kindAxis = normalizeAxis(matterResult.data.kind);
    const contributionUrl = matterResult.data.contribution_url || '';

    return {
      slug,
      title: matterResult.data.title || '제목 없음',
      date: matterResult.data.date || new Date().toISOString(),
      author: matterResult.data.author || '익명',
      contributionUrl,
      module: moduleAxis,
      kind: kindAxis,
      repo: resolveRepo(contributionUrl, matterResult.data.repo),
      issue: normalizePositiveInt(matterResult.data.issue),
      crbug: normalizePositiveInt(matterResult.data.crbug),
      related: normalizeRelated(matterResult.data.related),
      relatedSlugs:
        getAllContributions().find((c) => c.slug === slug)?.relatedSlugs ?? [],
      status: normalizeStatus(matterResult.data.status),
      excerpt,
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