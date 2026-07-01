import { render, screen } from '@testing-library/react';
import ContributorsPage from '@/app/contributors/page';
import * as contributorsModule from '@/lib/contributors';

jest.mock('@/lib/contributors', () => ({
  getContributorSummaries: jest.fn(),
}));

describe('기여자 목록 페이지', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('기여자 카드들이 렌더링되고 개별 프로필로 링크된다', () => {
    (contributorsModule.getContributorSummaries as jest.Mock).mockReturnValue([
      { username: 'octocat', isValidGithubUser: true, total: 5, merged: 4, inReview: 1, lastActive: '2025-06-01T00:00:00.000Z' },
      { username: 'hubot', isValidGithubUser: true, total: 3, merged: 2, inReview: 1, lastActive: '2025-05-01T00:00:00.000Z' },
    ]);

    render(<ContributorsPage />);

    expect(screen.getByText('octocat')).toBeInTheDocument();
    expect(screen.getByText('hubot')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /octocat/ })
    ).toHaveAttribute('href', '/contributors/octocat');
  });

  it('기여자가 없으면 빈 상태를 표시한다', () => {
    (contributorsModule.getContributorSummaries as jest.Mock).mockReturnValue([]);

    render(<ContributorsPage />);

    expect(screen.getByText('아직 기여자가 없습니다.')).toBeInTheDocument();
  });
});
