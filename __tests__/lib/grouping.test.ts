import { computeRelated } from '@/lib/contributions';
import { groupByRelated } from '@/lib/grouping';

describe('computeRelated', () => {
  test('connects shared assignments without merging distinct issues that share a crbug', () => {
    const related = computeRelated([
      { slug: '101', issue: 31, crbug: 9001, related: [] },
      { slug: '102', issue: 31, crbug: 9002, related: [] },
      { slug: '103', issue: 32, crbug: 9001, related: [] },
      { slug: '104', issue: 0, crbug: -1, related: [] },
    ]);

    expect(related.get('101')).toEqual(['102']);
    expect(related.get('102')).toEqual(['101']);
    expect(related.get('103')).toEqual([]);
    expect(related.get('104')).toEqual([]);
  });

  test('resolves explicit review IDs bidirectionally, deduplicates edges, and ignores unknown IDs', () => {
    const related = computeRelated([
      { slug: '101', related: [102, 102, 999, 101, 0] },
      { slug: '102', related: [] },
      { slug: '103', related: [-1] },
    ]);

    expect(related.get('101')).toEqual(['102']);
    expect(related.get('102')).toEqual(['101']);
    expect(related.get('103')).toEqual([]);
  });
});

describe('groupByRelated', () => {
  test('groups mixed transitive relations and preserves input order', () => {
    const records = [
      { slug: '3', issue: 32, related: [] },
      { slug: '1', issue: 31, related: [] },
      { slug: '2', issue: 31, related: [3] },
      { slug: '4', related: [] },
    ];
    const directRelations = computeRelated(records);
    const rows = groupByRelated(records.map((record) => ({
      ...record,
      relatedSlugs: directRelations.get(record.slug) ?? [],
    })));

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      type: 'group',
      items: [{ slug: '3' }, { slug: '1' }, { slug: '2' }],
      reason: 'related',
    });
    expect(rows[0]).not.toHaveProperty('relationId');
    expect(rows[1]).toEqual({
      type: 'single',
      item: { slug: '4', related: [], relatedSlugs: [] },
    });
  });

  test('keeps an unconnected contribution as a single row', () => {
    expect(groupByRelated([{ slug: '1', relatedSlugs: [] }])).toEqual([
      { type: 'single', item: { slug: '1', relatedSlugs: [] } },
    ]);
  });

  test('labels the shared assignment even when a crbug is also shared', () => {
    const rows = groupByRelated([
      { slug: '1', relatedSlugs: ['2'], issue: 31, crbug: 700 },
      { slug: '2', relatedSlugs: ['1'], issue: 31, crbug: 700 },
    ]);

    expect(rows[0]).toMatchObject({ type: 'group', reason: 'issue', relationId: 31 });
  });

  test('prefers issue over explicit-related reason', () => {
    const rows = groupByRelated([
      { slug: '1', relatedSlugs: ['2'], issue: 31 },
      { slug: '2', relatedSlugs: ['1'], issue: 31 },
    ]);

    expect(rows[0]).toMatchObject({ type: 'group', reason: 'issue', relationId: 31 });
  });

  test('marks an explicitly connected group without an external ID', () => {
    const rows = groupByRelated([
      { slug: '1', relatedSlugs: ['2'] },
      { slug: '2', relatedSlugs: [] },
    ]);

    expect(rows[0]).toMatchObject({ type: 'group', reason: 'related' });
    expect(rows[0]).not.toHaveProperty('relationId');
  });
});
