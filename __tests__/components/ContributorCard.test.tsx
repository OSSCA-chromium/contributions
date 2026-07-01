import { render, screen } from '@testing-library/react';
import ContributorCard from '@/components/ContributorCard';

test('유효한 기여자 카드에 username·집계·프로필 링크가 표시된다', () => {
  render(
    <ContributorCard
      summary={{
        username: 'octocat',
        isValidGithubUser: true,
        total: 5,
        merged: 4,
        inReview: 1,
      }}
    />
  );
  expect(screen.getByText('octocat')).toBeInTheDocument();
  expect(
    screen.getByText('총 5 · Merged 4 · In review 1')
  ).toBeInTheDocument();
  expect(screen.getByRole('link')).toHaveAttribute(
    'href',
    '/contributors/octocat'
  );
});

test('유효하지 않은 username은 링크 없이 렌더된다', () => {
  render(
    <ContributorCard
      summary={{
        username: '홍길동',
        isValidGithubUser: false,
        total: 2,
        merged: 1,
        inReview: 1,
      }}
    />
  );
  expect(screen.getByText('홍길동')).toBeInTheDocument();
  expect(screen.queryByRole('link')).toBeNull();
});
