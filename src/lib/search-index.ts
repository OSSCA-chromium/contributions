import type { Contribution, SearchIndexItem } from '@/lib/types';

export function buildSearchIndex(contributions: Contribution[]): SearchIndexItem[] {
  return contributions.map((c) => ({
    slug: c.slug,
    title: c.title,
    author: c.author,
    module: c.module,
    kind: c.kind,
    keywords: c.keywords,
    labels: c.labels,
    related: c.related,
    status: c.status,
    date: c.date,
    excerpt: c.excerpt,
  }));
}
