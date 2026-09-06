export type GroupedRow<T> =
  | { type: 'single'; item: T }
  | { type: 'group'; items: T[]; label?: string; href?: string; reason: 'crbug' | 'issue' | 'related' };

type Relatable = {
  slug: string;
  relatedSlugs: string[];
  issue?: number;
  crbug?: number;
};

// `computeRelated` only records DIRECT links, so three patches sharing one
// crbug can arrive as 1-2, 2-3 and would split into two groups if we grouped by
// links alone. Grouping therefore takes connected components of the undirected
// `relatedSlugs` graph, which merges chains back into one group.
export function groupByRelated<T extends Relatable>(items: T[]): GroupedRow<T>[] {
  const bySlug = new Map(items.map((i) => [i.slug, i]));
  const seen = new Set<string>();
  const rows: GroupedRow<T>[] = [];

  for (const start of items) {
    if (seen.has(start.slug)) continue;
    seen.add(start.slug);

    // Breadth-first walk over the component reachable from `start`.
    const component = new Set([start.slug]);
    const queue = [start];
    for (let head = 0; head < queue.length; head++) {
      for (const slug of queue[head].relatedSlugs) {
        const next = bySlug.get(slug);
        if (!next || seen.has(slug)) continue;
        seen.add(slug);
        component.add(slug);
        queue.push(next);
      }
    }

    if (component.size === 1) {
      rows.push({ type: 'single', item: start });
      continue;
    }
    // Filtering `items` (rather than reading the queue) keeps members in input
    // order — the caller's date-desc order — regardless of traversal order.
    const members = items.filter((i) => component.has(i.slug));
    rows.push({ type: 'group', items: members, ...describeGroup(members) });
  }

  return rows;
}

// A connected component can span several bugs/issues. Only name a reference
// as the group's common source when every member actually shares it.
function describeGroup(members: Relatable[]): {
  label?: string;
  href?: string;
  reason: 'crbug' | 'issue' | 'related';
} {
  const first = members[0];
  if (first.crbug !== undefined && members.every(item => item.crbug === first.crbug)) {
    return { label: `crbug ${first.crbug}`, href: `https://crbug.com/${first.crbug}`, reason: 'crbug' };
  }
  if (first.issue !== undefined && members.every(item => item.issue === first.issue)) {
    return { label: `이슈 #${first.issue}`, href: `https://github.com/OSSCA-chromium/contributions/issues/${first.issue}`, reason: 'issue' };
  }
  return { reason: 'related' };
}
