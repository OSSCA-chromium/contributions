import type { Contribution, SearchIndexItem } from '@/lib/types';

export function buildSearchIndex(contributions: Contribution[]): SearchIndexItem[] {
  return contributions.map((c) => ({
    slug: c.slug,
    title: c.title,
    author: c.author,
    contributionUrl: c.contributionUrl,
    module: c.module,
    kind: c.kind,
    repo: c.repo,
    issue: c.issue,
    crbug: c.crbug,
    relatedSlugs: c.relatedSlugs,
    status: c.status,
    date: c.date,
    excerpt: c.excerpt,
  }));
}
