export type GroupedRow<T> =
  | { type: 'single'; item: T }
  | {
      type: 'group';
      items: T[];
      reason: 'crbug' | 'issue' | 'related';
      relationId?: number;
    };

type RelatedItem = {
  slug: string;
  relatedSlugs: string[];
  issue?: number;
  crbug?: number;
};

function isPositiveId(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0;
}

function sharedId<T extends RelatedItem>(items: T[], field: 'issue' | 'crbug') {
  for (let i = 0; i < items.length; i++) {
    const leftId = items[i][field];
    if (!isPositiveId(leftId)) continue;
    for (let j = i + 1; j < items.length; j++) {
      if (items[j][field] === leftId) return leftId;
    }
  }
  return undefined;
}

function getGroupReason<T extends RelatedItem>(items: T[]) {
  const crbug = sharedId(items, 'crbug');
  if (crbug !== undefined) return { reason: 'crbug' as const, relationId: crbug };

  const issue = sharedId(items, 'issue');
  if (issue !== undefined) return { reason: 'issue' as const, relationId: issue };

  return { reason: 'related' as const };
}

export function groupByRelated<T extends RelatedItem>(items: T[]): GroupedRow<T>[] {
  const itemBySlug = new Map(items.map((item) => [item.slug, item]));
  const orderBySlug = new Map(items.map((item, index) => [item.slug, index]));
  const neighbors = new Map(items.map(({ slug }) => [slug, new Set<string>()]));

  for (const item of items) {
    for (const relatedSlug of item.relatedSlugs) {
      if (!itemBySlug.has(relatedSlug) || item.slug === relatedSlug) continue;
      neighbors.get(item.slug)?.add(relatedSlug);
      neighbors.get(relatedSlug)?.add(item.slug);
    }
  }

  const visited = new Set<string>();
  const rows: GroupedRow<T>[] = [];

  for (const item of items) {
    if (visited.has(item.slug)) continue;

    const component: T[] = [];
    const queue = [item.slug];
    visited.add(item.slug);
    let queueIndex = 0;

    while (queueIndex < queue.length) {
      const slug = queue[queueIndex++];
      const member = itemBySlug.get(slug);
      if (!member) continue;
      component.push(member);

      for (const neighbor of neighbors.get(slug) ?? []) {
        if (visited.has(neighbor)) continue;
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }

    component.sort((left, right) =>
      (orderBySlug.get(left.slug) ?? 0) - (orderBySlug.get(right.slug) ?? 0)
    );

    if (component.length === 1) {
      rows.push({ type: 'single', item: component[0] });
    } else {
      rows.push({ type: 'group', items: component, ...getGroupReason(component) });
    }
  }

  return rows;
}
