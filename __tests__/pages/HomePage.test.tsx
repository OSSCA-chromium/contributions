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
  });

  it('타이틀과 소개 문구가 렌더링됩니다', () => {
    // 빈 배열 반환하도록 모의 설정
    (contributionsModule.getAllContributions as jest.Mock).mockReturnValue([]);
    (contributionsModule.getUniqueContributors as jest.Mock).mockReturnValue([]);

    render(<HomePage />);

    // 헤더와 소개 문구 체크
    expect(screen.getByText('Recent contributions')).toBeInTheDocument();
    expect(screen.getByText('아직 등록된 컨트리뷰션이 없습니다.')).toBeInTheDocument();
  });

  it('최근 컨트리뷰션 섹션이 있습니다', () => {
    (contributionsModule.getAllContributions as jest.Mock).mockReturnValue([]);
    (contributionsModule.getUniqueContributors as jest.Mock).mockReturnValue([]);

    render(<HomePage />);

    expect(screen.getByText('Recent contributions')).toBeInTheDocument();
    expect(screen.getByText('아직 등록된 컨트리뷰션이 없습니다.')).toBeInTheDocument();
  });

  it('컨트리뷰션이 있을 경우 목록이 표시됩니다', () => {
    // 샘플 컨트리뷰션 데이터 생성
    const mockContributions = [
      {
        slug: 'test-contribution-1',
        title: '테스트 컨트리뷰션 1',
        date: '2025-01-01',
        author: '홍길동',
        labels: [],
        excerpt: '테스트 컨트리뷰션 1 내용',
      },
      {
        slug: 'test-contribution-2',
        title: '테스트 컨트리뷰션 2',
        date: '2025-01-02',
        author: '김철수',
        labels: [],
        excerpt: '테스트 컨트리뷰션 2 내용',
      },
    ];

    (contributionsModule.getAllContributions as jest.Mock).mockReturnValue(mockContributions);
    (contributionsModule.getUniqueContributors as jest.Mock).mockReturnValue([]);

    render(<HomePage />);

    expect(screen.getByText('테스트 컨트리뷰션 1')).toBeInTheDocument();
    expect(screen.getByText('테스트 컨트리뷰션 2')).toBeInTheDocument();
  });

  it('Contributors 섹션이 있습니다', () => {
    (contributionsModule.getAllContributions as jest.Mock).mockReturnValue([]);
    (contributionsModule.getUniqueContributors as jest.Mock).mockReturnValue([]);

    render(<HomePage />);

    expect(screen.getByText('Contributors')).toBeInTheDocument();
    expect(screen.getByText('등록된 컨트리뷰터가 없습니다.')).toBeInTheDocument();
  });
}); 