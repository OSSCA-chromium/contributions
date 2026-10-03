import { createContributionGraph, layoutContributionGraph } from '@/lib/contribution-graph';
import type { SearchIndexItem } from '@/lib/types';

function item(slug: string, extra: Partial<SearchIndexItem> = {}): SearchIndexItem {
  return { slug, title: `Patch ${slug}`, date: '2026-10-01', author: 'alice',
    module: 'blink', kind: 'fix', keywords: [], labels: [], related: [],
    relatedSlugs: [], status: 'merged', excerpt: '', ...extra };
}

test('groups patches by repository and counts only recorded relationships once', () => {
  const graph = createContributionGraph([
    item('1', { crbug: 42, relatedSlugs: ['2', '2', 'missing', '1'] }),
    item('2', { crbug: 42, relatedSlugs: ['1'], repo: 'v8/v8' }),
    item('3', { repo: 'devtools/devtools-frontend' }),
    item('4'),
  ]);
  expect(graph.projects.map(p => [p.repo, p.label, p.count])).toEqual([
    ['chromium/src', 'Chromium', 2],
    ['devtools/devtools-frontend', 'DevTools frontend', 1],
    ['v8/v8', 'V8', 1],
  ]);
  expect(graph.edges).toEqual([{ source: '1', target: '2', reason: 'crbug' }]);
  expect(graph.relatedPatchCount).toBe(2);
  expect(graph.nodes).toHaveLength(4);
});

test('does not invent edges from an author or module and preserves one-way related links', () => {
  const graph = createContributionGraph([
    item('1', { relatedSlugs: ['2'] }), item('2'), item('3'),
  ]);
  expect(graph.edges).toEqual([{ source: '1', target: '2', reason: 'related' }]);
  expect(createContributionGraph([item('1'), item('2')]).edges).toEqual([]);
  expect(createContributionGraph([]).projects).toEqual([]);
});

test.each([360, 1440])('lays out finite, deterministic points inside their project clouds at %ipx', (width) => {
  const graph = createContributionGraph(Array.from({ length: 166 }, (_, i) => item(String(i), {
    repo: i < 163 ? undefined : i < 165 ? 'v8/v8' : 'devtools/devtools-frontend',
  })));
  const layout = layoutContributionGraph(graph, width);
  expect(layout).toEqual(layoutContributionGraph(graph, width));
  expect(layout.nodes).toHaveLength(166);
  for (const node of layout.nodes) {
    expect(node.x).toBe(Number(node.x.toFixed(2)));
    expect(node.y).toBe(Number(node.y.toFixed(2)));
    expect(Number.isFinite(node.x) && Number.isFinite(node.y)).toBe(true);
    expect(node.x).toBeGreaterThan(0);
    expect(node.x).toBeLessThan(width);
    expect(node.y).toBeGreaterThan(0);
    expect(node.y).toBeLessThan(layout.height);
  }
});
