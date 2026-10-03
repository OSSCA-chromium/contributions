import { render, screen } from '@testing-library/react';
import ContributorRow from '@/components/ContributorRow';

test('유효한 기여자 행에 username·상태별 건수·프로필 링크가 표시된다', () => {
  render(
    <ContributorRow
      summary={{
        username: 'octocat',
        isValidGithubUser: true,
        total: 7,
        merged: 4,
        inReview: 1,
        abandoned: 2,
        lastActive: '2025-06-04T00:00:00.000Z',
      }}
    />
  );
  expect(screen.getByRole('img', { name: 'octocat 프로필 이미지' })).toBeInTheDocument();
  expect(screen.queryByText('octocat')).not.toBeInTheDocument();
  expect(screen.getByText('총 기여')).toBeInTheDocument();
  expect(screen.getByText('Merged')).toBeInTheDocument();
  expect(screen.getByText('In review').parentElement).toHaveTextContent('In review1');
  expect(screen.getByText('Abandoned').parentElement).toHaveTextContent('Abandoned2');
  expect(screen.getByText('7')).toBeInTheDocument(); // total
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
        abandoned: 0,
        lastActive: '2025-05-01T00:00:00.000Z',
      }}
    />
  );
  expect(screen.getByRole('img', { name: '홍길동 프로필 이미지' })).toBeInTheDocument();
  expect(screen.queryByText('홍길동')).not.toBeInTheDocument();
  expect(screen.getByText('Abandoned').parentElement).toHaveTextContent('Abandoned0');
  expect(screen.queryByRole('link')).toBeNull();
});
