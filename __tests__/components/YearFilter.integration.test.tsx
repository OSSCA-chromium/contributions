import { render, screen, fireEvent, within } from '@testing-library/react';
import ContributionSearch from '@/components/ContributionSearch';
import type { SearchIndexItem } from '@/lib/types';

const items: SearchIndexItem[] = [
  {
    slug: '1',
    title: '2025 patch',
    date: '2025-05-08',
    author: 'octocat',
    labels: ['docs'],
    status: 'merged',
    excerpt: 'a',
  },
  {
    slug: '2',
    title: '2026 patch',
    date: '2026-02-01',
    author: 'hubot',
    labels: ['test'],
    status: 'in review',
    excerpt: 'b',
  },
];

test('연도 선택을 바꾸면 목록 결과가 그에 맞게 바뀐다', () => {
  render(<ContributionSearch items={items} />);

  // 연도 선택기 그룹으로 한정(상태 필터에도 '전체' 버튼이 있어 충돌 방지)
  const yearGroup = screen.getByRole('group', { name: '연도 선택' });

  // 초기 2026(데이터에 있어 기본값): 2026 항목만
  expect(screen.getByText('2026 patch')).toBeInTheDocument();
  expect(screen.queryByText('2025 patch')).not.toBeInTheDocument();

  // 2025 선택: 2025 항목만
  fireEvent.click(within(yearGroup).getByRole('button', { name: '2025' }));
  expect(screen.getByText('2025 patch')).toBeInTheDocument();
  expect(screen.queryByText('2026 patch')).not.toBeInTheDocument();

  // 전체 선택: 둘 다
  fireEvent.click(within(yearGroup).getByRole('button', { name: '전체' }));
  expect(screen.getByText('2025 patch')).toBeInTheDocument();
  expect(screen.getByText('2026 patch')).toBeInTheDocument();
});
