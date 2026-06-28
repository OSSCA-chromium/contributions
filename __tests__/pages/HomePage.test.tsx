import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';
import * as contributionsModule from '@/lib/contributions';

// contributions 모듈 모킹
jest.mock('@/lib/contributions', () => ({
  getAllContributions: jest.fn(),
  getUniqueContributors: jest.fn().mockReturnValue([]),
  isValidGithubUsername: jest.fn()
}));

describe('홈페이지', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('타이틀과 소개 문구가 렌더링됩니다', () => {
    // 빈 배열 반환하도록 모의 설정
    (contributionsModule.getAllContributions as jest.Mock).mockReturnValue([]);
    (contributionsModule.getUniqueContributors as jest.Mock).mockReturnValue([]);

    render(
      <HomePage />
    );

    // 히어로 타이틀과 빈 상태 안내 체크
    expect(screen.getByText('OSSCA Chromium Contributions')).toBeInTheDocument();
    expect(screen.getByText('2026년 컨트리뷰션이 아직 없습니다.')).toBeInTheDocument();
  });

  it('데이터가 있으면 최근 컨트리뷰션 섹션이 있습니다', () => {
    const mockContributions = [
      {
        slug: 'test-contribution-1',
        title: '테스트 컨트리뷰션 1',
        date: '2026-01-01',
        author: '홍길동',
        labels: [],
        excerpt: '테스트 컨트리뷰션 1 내용',
      },
    ];

    (contributionsModule.getAllContributions as jest.Mock).mockReturnValue(mockContributions);
    (contributionsModule.getUniqueContributors as jest.Mock).mockReturnValue([]);

    render(
      <HomePage />
    );

    expect(screen.getByText('Recent contributions')).toBeInTheDocument();
  });

  it('컨트리뷰션이 있을 경우 목록이 표시됩니다', () => {
    // 기본 연도 2026과 일치하도록 date를 2026으로 설정
    const mockContributions = [
      {
        slug: 'test-contribution-1',
        title: '테스트 컨트리뷰션 1',
        date: '2026-01-01',
        author: '홍길동',
        labels: [],
        excerpt: '테스트 컨트리뷰션 1 내용',
      },
      {
        slug: 'test-contribution-2',
        title: '테스트 컨트리뷰션 2',
        date: '2026-01-02',
        author: '김철수',
        labels: [],
        excerpt: '테스트 컨트리뷰션 2 내용',
      },
    ];

    (contributionsModule.getAllContributions as jest.Mock).mockReturnValue(mockContributions);
    (contributionsModule.getUniqueContributors as jest.Mock).mockReturnValue([]);

    render(
      <HomePage />
    );

    expect(screen.getByText('테스트 컨트리뷰션 1')).toBeInTheDocument();
    expect(screen.getByText('테스트 컨트리뷰션 2')).toBeInTheDocument();
  });

  it('데이터가 있으면 Contributors 섹션이 있습니다', () => {
    const mockContributions = [
      {
        slug: 'test-contribution-1',
        title: '테스트 컨트리뷰션 1',
        date: '2026-01-01',
        author: '홍길동',
        labels: [],
        excerpt: '테스트 컨트리뷰션 1 내용',
      },
    ];

    (contributionsModule.getAllContributions as jest.Mock).mockReturnValue(mockContributions);
    (contributionsModule.getUniqueContributors as jest.Mock).mockReturnValue([]);

    render(
      <HomePage />
    );

    expect(screen.getByText('Contributors')).toBeInTheDocument();
  });
});
