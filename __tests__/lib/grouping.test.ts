import { groupByRelated, type GroupedRow } from '@/lib/grouping';

const item = (slug: string, relatedSlugs: string[] = [], extra = {}) => ({
  slug, relatedSlugs, issue: undefined, crbug: undefined, ...extra,
});

// GroupedRow is a discriminated union, so `.items` / `.label` need narrowing
// before the assertions below can read them.
function asGroup<T>(row: GroupedRow<T>) {
  if (row.type !== 'group') throw new Error(`expected a group row, got "${row.type}"`);
  return row;
}

test('연관이 없으면 전부 단독 항목이다', () => {
  const out = groupByRelated([item('1'), item('2')]);
  expect(out).toEqual([
    { type: 'single', item: expect.objectContaining({ slug: '1' }) },
    { type: 'single', item: expect.objectContaining({ slug: '2' }) },
  ]);
});

test('서로 연관된 항목을 한 그룹으로 묶는다', () => {
  const out = groupByRelated([item('1', ['2']), item('2', ['1']), item('3')]);
  expect(out).toHaveLength(2);
  expect(out[0]).toMatchObject({ type: 'group' });
  expect(asGroup(out[0]).items.map((i) => i.slug)).toEqual(['1', '2']);
  expect(out[1]).toMatchObject({ type: 'single' });
});

test('연쇄 연관(1-2, 2-3)을 하나의 그룹으로 합친다', () => {
  const out = groupByRelated([item('1', ['2']), item('2', ['1', '3']), item('3', ['2'])]);
  expect(out).toHaveLength(1);
  expect(asGroup(out[0]).items.map((i) => i.slug)).toEqual(['1', '2', '3']);
});

test('모든 패치가 공유하는 crbug 또는 이슈를 그룹 라벨로 쓴다', () => {
  const withCrbug = groupByRelated([item('1', ['2'], { crbug: 42 }), item('2', ['1'], { crbug: 42 })]);
  expect(asGroup(withCrbug[0]).label).toBe('crbug 42');
  const withIssue = groupByRelated([item('3', ['4'], { issue: 7 }), item('4', ['3'], { issue: 7 })]);
  expect(asGroup(withIssue[0]).label).toBe('이슈 #7');
  const plain = groupByRelated([item('5', ['6']), item('6', ['5'])]);
  expect(asGroup(plain[0]).label).toBeUndefined();
});

test('첫 패치의 crbug를 그룹 전체의 공통 근거로 표시하지 않는다', () => {
  const out = groupByRelated([
    item('1', ['2'], { crbug: 42 }),
    item('2', ['1', '3'], { crbug: 43 }),
    item('3', ['2']),
  ]);
  expect(asGroup(out[0]).label).toBeUndefined();
});

test('crbug가 달라도 모든 패치가 같은 이슈면 이슈 라벨을 쓴다', () => {
  const out = groupByRelated([
    item('1', ['2'], { crbug: 42, issue: 7 }),
    item('2', ['1'], { crbug: 43, issue: 7 }),
  ]);
  expect(asGroup(out[0]).label).toBe('이슈 #7');
});
