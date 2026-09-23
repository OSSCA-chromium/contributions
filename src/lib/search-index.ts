import type { Contribution, SearchIndexItem } from '@/lib/types';

export function buildSearchIndex(contributions: Contribution[]): SearchIndexItem[] {
  return contributions.map((c) => ({
    slug: c.slug,
    title: c.title,
    author: c.author,
    ...(c.repo ? { repo: c.repo } : {}),
    module: c.module,
    kind: c.kind,
    keywords: c.keywords,
    labels: c.labels,
    ...(c.issue === undefined ? {} : { issue: c.issue }),
    ...(c.crbug === undefined ? {} : { crbug: c.crbug }),
    related: c.related,
    relatedSlugs: c.relatedSlugs,
    status: c.status,
    date: c.date,
    excerpt: c.excerpt,
  }));
}
