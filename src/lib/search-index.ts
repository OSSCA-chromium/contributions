import type { Contribution, SearchIndexItem } from '@/lib/types';

export function buildSearchIndex(contributions: Contribution[]): SearchIndexItem[] {
  return contributions.map((c) => ({
    slug: c.slug,
    title: c.title,
    author: c.author,
    labels: c.labels,
    status: c.status,
    date: c.date,
    excerpt: c.excerpt,
  }));
}
