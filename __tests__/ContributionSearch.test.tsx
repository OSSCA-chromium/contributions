import { render, screen, fireEvent } from '@testing-library/react';
import ContributionSearch from '@/components/ContributionSearch';

const items = [
  {
    slug: '1',
    title: 'Fix docs',
    date: '2025-05-08',
    author: 'octocat',
    labels: ['docs'],
    status: 'merged' as const,
    excerpt: 'a',
  },
  {
    slug: '2',
    title: 'Add test',
    date: '2025-05-09',
    author: 'hubot',
    labels: ['test'],
    status: 'in review' as const,
    excerpt: 'b',
  },
];

test('검색어로 항목을 필터링한다', () => {
  render(<ContributionSearch items={items} />);
  fireEvent.change(screen.getByPlaceholderText(/검색/), { target: { value: 'docs' } });
  expect(screen.getByText('Fix docs')).toBeInTheDocument();
  expect(screen.queryByText('Add test')).not.toBeInTheDocument();
});

test('상태 필터 칩으로 필터링한다', () => {
  render(<ContributionSearch items={items} />);
  fireEvent.click(screen.getByRole('button', { name: /merged/i }));
  expect(screen.getByText('Fix docs')).toBeInTheDocument();
  expect(screen.queryByText('Add test')).not.toBeInTheDocument();
});
