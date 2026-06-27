import { render, screen } from '@testing-library/react';
import ContributionCard from '@/components/ContributionCard';

const c = {
  slug: '123',
  title: '테스트 제목',
  date: '2025-05-08',
  author: 'octocat',
  labels: ['docs'],
  status: 'merged' as const,
  excerpt: '요약 내용',
};

test('카드에 제목/상태/링크가 표시된다', () => {
  render(<ContributionCard contribution={c} />);
  expect(screen.getByText('테스트 제목')).toBeInTheDocument();
  expect(screen.getByText('MERGED')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /테스트 제목/ })).toHaveAttribute(
    'href',
    '/patches/123'
  );
});
