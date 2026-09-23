import { fireEvent, render, screen } from '@testing-library/react';
import StatsView from '@/components/StatsView';
import type { SearchIndexItem } from '@/lib/types';

function item(
  slug: string,
  date: string,
  author: string,
  status: SearchIndexItem['status']
): SearchIndexItem {
  return {
    slug,
    title: slug,
    author,
    module: 'ui',
    kind: 'fix',
    keywords: [],
    labels: [],
    related: [],
    relatedSlugs: [],
    status,
    date,
    excerpt: '',
  };
}

function statValue(label: string) {
  const labelElement = screen.getByText(label);
  return labelElement.previousElementSibling;
}

test('빈 데이터에서는 빈 상태를 보여 주고 통계 차트를 숨긴다', () => {
  render(<StatsView items={[]} />);

  expect(screen.getByText('표시할 데이터가 없습니다.')).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: '상태 분포' })).toBeNull();
});

test('연도를 선택하면 통계 값을 필터링하면서 차트를 유지한다', () => {
  render(
    <StatsView
      items={[
        item('2026-merged', '2026-01-01', 'alice', 'merged'),
        item('2025-review', '2025-01-02', 'bob', 'in review'),
        item('2025-abandoned', '2025-01-03', 'carol', 'abandoned'),
      ]}
    />
  );

  expect(statValue('총 컨트리뷰션')).toHaveTextContent('1');
  fireEvent.click(screen.getByRole('button', { name: '2025' }));

  expect(statValue('총 컨트리뷰션')).toHaveTextContent('2');
  expect(statValue('기여자 수')).toHaveTextContent('2');
  expect(screen.getByRole('heading', { name: '상태 분포' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '월별 추이' })).toBeInTheDocument();
});

test('세 상태 데이터셋에서 전체 합계와 차트를 표시한다', () => {
  render(
    <StatsView
      items={[
        item('merged', '2026-01-01', 'alice', 'merged'),
        item('in-review', '2026-01-02', 'bob', 'in review'),
        item('abandoned', '2026-01-03', 'carol', 'abandoned'),
      ]}
    />
  );

  expect(statValue('총 컨트리뷰션')).toHaveTextContent('3');
  expect(statValue('Merged 비율')).toHaveTextContent('33%');
  expect(screen.getByRole('heading', { name: '상태 분포' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '월별 추이' })).toBeInTheDocument();
});
