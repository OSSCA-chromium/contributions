import { render, screen, fireEvent } from '@testing-library/react';
import ContributorsList from '@/components/ContributorsList';

const summaries = [
  {
    username: 'alice',
    isValidGithubUser: true,
    total: 1,
    merged: 1,
    inReview: 0,
    lastActive: '2025-06-01T00:00:00.000Z',
  },
  {
    username: 'bob',
    isValidGithubUser: true,
    total: 5,
    merged: 0,
    inReview: 5,
    lastActive: '2025-01-01T00:00:00.000Z',
  },
];

test('기본은 최신순(lastActive desc): alice가 먼저', () => {
  render(<ContributorsList summaries={summaries} />);
  const links = screen.getAllByRole('link');
  expect(links[0]).toHaveTextContent('alice'); // 2025-06
  expect(links[1]).toHaveTextContent('bob'); // 2025-01
});

test('total 정렬 선택 시 total desc: bob이 먼저', () => {
  render(<ContributorsList summaries={summaries} />);
  fireEvent.change(screen.getByLabelText('정렬 기준'), {
    target: { value: 'total' },
  });
  const links = screen.getAllByRole('link');
  expect(links[0]).toHaveTextContent('bob'); // total 5
  expect(links[1]).toHaveTextContent('alice'); // total 1
});

test('merged 정렬 선택 시 merged desc: alice가 먼저', () => {
  render(<ContributorsList summaries={summaries} />);
  fireEvent.change(screen.getByLabelText('정렬 기준'), {
    target: { value: 'merged' },
  });
  const links = screen.getAllByRole('link');
  expect(links[0]).toHaveTextContent('alice'); // merged 1
  expect(links[1]).toHaveTextContent('bob'); // merged 0
});
