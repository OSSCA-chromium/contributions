import { render, screen, fireEvent, within } from '@testing-library/react';
import ContributionSearch from '@/components/ContributionSearch';
import type { SearchIndexItem } from '@/lib/types';

const items: SearchIndexItem[] = [
  {
    slug: '1',
    title: 'Fix docs',
    date: '2026-05-08',
    author: 'octocat',
    module: 'docs',
    kind: 'fix',
    repo: 'chromium/src',
    relatedSlugs: [],
    status: 'merged',
    excerpt: 'a',
  },
  {
    slug: '2',
    title: 'Add test',
    date: '2026-05-09',
    author: 'hubot',
    module: 'base',
    kind: 'test',
    repo: 'chromium/src',
    relatedSlugs: [],
    status: 'in review',
    excerpt: 'b',
  },
  {
    slug: '3',
    title: 'Clean docs',
    date: '2026-05-10',
    author: 'hubot',
    module: 'docs',
    kind: 'refactor',
    repo: 'chromium/src',
    relatedSlugs: [],
    status: 'merged',
    excerpt: 'c',
  },
];

// 각 축이 자기 '전체' 버튼을 가지므로 축 그룹으로 한정해서 누른다.
const pill = (axis: string, name: string) =>
  within(screen.getByRole('group', { name: `${axis} 선택` })).getByRole('button', { name });

test('검색어로 항목을 필터링한다', () => {
  render(<ContributionSearch items={items} />);
  fireEvent.change(screen.getByRole('searchbox', { name: '검색' }), {
    target: { value: 'octocat' },
  });
  expect(screen.getByText('Fix docs')).toBeInTheDocument();
  expect(screen.queryByText('Add test')).not.toBeInTheDocument();
});

test('상태 필터 칩으로 필터링한다', () => {
  render(<ContributionSearch items={items} />);
  fireEvent.click(pill('상태', 'merged'));
  expect(screen.getByText('Fix docs')).toBeInTheDocument();
  expect(screen.getByText('Clean docs')).toBeInTheDocument();
  expect(screen.queryByText('Add test')).not.toBeInTheDocument();
});

test('모듈 필터가 항목을 좁힌다', () => {
  render(<ContributionSearch items={items} />);
  fireEvent.click(pill('모듈', 'docs'));
  expect(screen.getByText('Fix docs')).toBeInTheDocument();
  expect(screen.getByText('Clean docs')).toBeInTheDocument();
  expect(screen.queryByText('Add test')).not.toBeInTheDocument();
});

test('종류 필터가 항목을 좁힌다', () => {
  render(<ContributionSearch items={items} />);
  fireEvent.click(pill('종류', 'fix'));
  expect(screen.getByText('Fix docs')).toBeInTheDocument();
  expect(screen.queryByText('Clean docs')).not.toBeInTheDocument();
  expect(screen.queryByText('Add test')).not.toBeInTheDocument();
});

test('모듈과 종류를 함께 선택하면 교집합이다', () => {
  render(<ContributionSearch items={items} />);
  fireEvent.click(pill('모듈', 'docs'));
  fireEvent.click(pill('종류', 'refactor'));
  expect(screen.getByText('Clean docs')).toBeInTheDocument();
  expect(screen.queryByText('Fix docs')).not.toBeInTheDocument();
  expect(screen.queryByText('Add test')).not.toBeInTheDocument();
});

// 축은 단일 선택이라 같은 축의 다른 값을 누르면 앞선 선택을 대체한다.
test('같은 축에서 다른 값을 누르면 선택이 바뀐다', () => {
  render(<ContributionSearch items={items} />);
  fireEvent.click(pill('모듈', 'docs'));
  fireEvent.click(pill('모듈', 'base'));
  expect(screen.getByText('Add test')).toBeInTheDocument();
  expect(screen.queryByText('Fix docs')).not.toBeInTheDocument();
});

test("'전체' 필로 축 선택을 해제한다", () => {
  render(<ContributionSearch items={items} />);
  fireEvent.click(pill('모듈', 'docs'));
  expect(screen.queryByText('Add test')).not.toBeInTheDocument();

  fireEvent.click(pill('모듈', '전체'));
  expect(screen.getByText('Add test')).toBeInTheDocument();
  expect(screen.getByText('Fix docs')).toBeInTheDocument();
});

test('표시 건수를 보여준다', () => {
  render(<ContributionSearch items={items} />);
  expect(screen.getByRole('status')).toHaveTextContent('전체 3건 중 3건 표시');

  fireEvent.click(pill('모듈', 'docs'));
  expect(screen.getByRole('status')).toHaveTextContent('전체 3건 중 2건 표시');
});
