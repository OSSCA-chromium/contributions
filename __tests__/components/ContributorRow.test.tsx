import { render, screen } from '@testing-library/react';
import ContributorRow from '@/components/ContributorRow';

test('유효한 기여자 행에 username·MERGED/IN REVIEW·프로필 링크가 표시된다', () => {
  render(
    <ContributorRow
      summary={{
        username: 'octocat',
        isValidGithubUser: true,
        total: 5,
        merged: 4,
        inReview: 1,
        lastActive: '2025-06-04T00:00:00.000Z',
      }}
    />
  );
  expect(screen.getByText('octocat')).toBeInTheDocument();
  expect(screen.getByText('TOTAL')).toBeInTheDocument();
  expect(screen.getByText('MERGED')).toBeInTheDocument();
  expect(screen.getByText('IN REVIEW')).toBeInTheDocument();
  expect(screen.getByText('5')).toBeInTheDocument(); // total
  expect(screen.getByText('4')).toBeInTheDocument(); // merged
  expect(screen.getByText('1')).toBeInTheDocument(); // in review
  expect(screen.getByText(/Updated 2025-06-04/)).toBeInTheDocument();
  expect(screen.getByRole('link')).toHaveAttribute(
    'href',
    '/contributors/octocat'
  );
});

test('유효하지 않은 username은 링크 없이 렌더된다', () => {
  render(
    <ContributorRow
      summary={{
        username: '홍길동',
        isValidGithubUser: false,
        total: 2,
        merged: 1,
        inReview: 1,
        lastActive: '2025-05-01T00:00:00.000Z',
      }}
    />
  );
  expect(screen.getByText('홍길동')).toBeInTheDocument();
  expect(screen.queryByRole('link')).toBeNull();
});
