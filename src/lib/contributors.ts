import { getAllContributions } from '@/lib/contributions';
import { isValidGithubUsername } from '@/lib/github';
import type { Contribution, ContributorSummary } from '@/lib/types';

// author별로 컨트리뷰션을 그룹화
function groupByAuthor(): Map<string, Contribution[]> {
  const groups = new Map<string, Contribution[]>();
  for (const contribution of getAllContributions()) {
    const author = contribution.author;
    if (!author) continue;
    const list = groups.get(author) ?? [];
    list.push(contribution);
    groups.set(author, list);
  }
  return groups;
}

// 컨트리뷰션 목록으로부터 요약 통계를 계산
function summarize(username: string, contributions: Contribution[]): ContributorSummary {
  let merged = 0;
  let inReview = 0;
  for (const c of contributions) {
    if (c.status === 'merged') merged++;
    else if (c.status === 'in review') inReview++;
  }
  return {
    username,
    isValidGithubUser: isValidGithubUsername(username),
    total: contributions.length,
    merged,
    inReview,
  };
}

// 모든 기여자의 요약 통계 (총 기여 수 내림차순)
export function getContributorSummaries(): ContributorSummary[] {
  const groups = groupByAuthor();
  return Array.from(groups.entries())
    .map(([username, contributions]) => summarize(username, contributions))
    .sort((a, b) => b.total - a.total);
}

// 특정 기여자의 요약 + 컨트리뷰션 목록
export function getContributorByUsername(
  username: string
): { summary: ContributorSummary; contributions: Contribution[] } | null {
  const groups = groupByAuthor();
  const contributions = groups.get(username);
  if (!contributions || contributions.length === 0) {
    return null;
  }
  return {
    summary: summarize(username, contributions),
    contributions,
  };
}

// 정적 생성을 위한 slug 목록 (유효한 GitHub username만)
export function getContributorSlugs(): { username: string }[] {
  const groups = groupByAuthor();
  return Array.from(groups.keys())
    .filter((username) => isValidGithubUsername(username))
    .map((username) => ({ username }));
}
