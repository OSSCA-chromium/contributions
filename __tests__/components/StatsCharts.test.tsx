import { render, screen, within } from '@testing-library/react';
import StatsCharts from '@/components/StatsCharts';
import type { Stats } from '@/lib/types';

jest.mock('recharts', () => {
  const actual = jest.requireActual('recharts');
  const React = jest.requireActual('react');
  return { ...actual, ResponsiveContainer: ({ children }: { children: React.ReactElement }) => React.cloneElement(children, { width: 600, height: 260 }) };
});

const stats: Stats = {
  total: 4, contributorCount: 2, mergedRatio: .5, moduleCount: 2,
  byStatus: [{ status: 'merged', count: 2 }, { status: 'in review', count: 1 }, { status: 'abandoned', count: 1 }],
  byMonth: [{ month: '2026-08', count: 1 }, { month: '2026-09', count: 3 }],
  topContributors: [
    { username: 'alice', count: 3, byStatus: [{ status: 'merged', count: 1 }, { status: 'in review', count: 1 }, { status: 'abandoned', count: 1 }] },
    { username: 'bob', count: 1, byStatus: [{ status: 'merged', count: 1 }] },
  ],
  byModule: [{ module: 'blink/renderer', count: 3 }, { module: 'base', count: 1 }],
};

test('exposes status totals and shares alongside the donut', () => {
  render(<StatsCharts stats={stats} />);
  const status = screen.getByRole('region', { name: '상태 분포' });
  expect(within(status).getByText('Merged')).toBeInTheDocument();
  expect(within(status).getByText('2건 · 50%')).toBeInTheDocument();
  expect(within(status).getAllByText('1건 · 25%')).toHaveLength(2);
});

test('shows contributor photos, readable module shares, and a monthly data table', () => {
  render(<StatsCharts stats={stats} />);
  const ranking = screen.getByRole('list', { name: '기여자별 기여 수' });
  expect(within(ranking).getByRole('img', { name: 'alice 프로필 이미지' })).toBeInTheDocument();
  expect(screen.queryByText('alice')).not.toBeInTheDocument();
  expect(within(ranking).getByText('3건')).toBeInTheDocument();
  const modules = screen.getByRole('region', { name: '모듈 분포' });
  expect(within(modules).getByText('blink/renderer')).toBeInTheDocument();
  expect(within(modules).getByText('3건 · 75%')).toBeInTheDocument();
  const table = screen.getByRole('table', { name: '월별 기여 수', hidden: true });
  expect(within(table).getByText('2026-09')).toBeInTheDocument();
  expect(within(table).getByText('3')).toBeInTheDocument();
});

test('does not leave keyboard focus stops inside decorative charts', () => {
  const { container } = render(<StatsCharts stats={stats} />);
  expect(container.querySelectorAll('svg.recharts-surface')).toHaveLength(2);
  expect(container.querySelector('[aria-hidden="true"] [tabindex="0"]')).toBeNull();
});
