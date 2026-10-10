import { fireEvent, render, screen, within } from '@testing-library/react';
import ContributorsPage from '@/app/contributors/page';
import { getAllContributions } from '@/lib/contributions';
import type { Contribution } from '@/lib/types';

jest.mock('@/lib/contributions', () => ({
  getAllContributions: jest.fn(),
}));

function contribution(
  slug: string,
  author: string,
  date: string,
  status: Contribution['status'],
): Contribution {
  return {
    slug, author, date, status, title: `Patch ${slug}`,
    module: 'docs', kind: 'fix', keywords: [], labels: [],
    related: [], relatedSlugs: [], excerpt: '',
  };
}

function expectStatusCount(username: string, status: string, count: number) {
  const card = screen.getByRole('heading', { name: username }).closest('article')!;
  const label = within(card).getByText(status, { selector: 'dt' });
  expect(label.nextElementSibling).toHaveTextContent(String(count));
}

describe('기여자 목록 페이지', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('선택한 연도로 기여자와 상태별 건수, 최근 기여일을 집계한다', () => {
    (getAllContributions as jest.Mock).mockReturnValue([
      contribution('1', 'alice', '2025-06-01', 'merged'),
      contribution('2', 'alice', '2026-02-01', 'in review'),
      contribution('3', 'bob', '2025-05-01', 'abandoned'),
      contribution('4', 'bob', '2025-04-01', 'merged'),
      contribution('5', 'carol', '2026-09-01', 'merged'),
      contribution('6', 'carol', '2026-09-02', 'merged'),
    ]);

    render(<ContributorsPage />);
    const years = screen.getByRole('group', { name: '연도 선택' });
    expect(within(years).getByRole('button', { name: '2026' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('2명')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(2);
    expect(screen.queryByRole('heading', { name: 'bob' })).not.toBeInTheDocument();
    expectStatusCount('alice', 'Merged', 0);
    expectStatusCount('alice', 'In Review', 1);
    expectStatusCount('carol', 'Merged', 2);
    expect(screen.getByText('2026-09-02')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /alice/ })).toHaveAttribute('href', '/contributors/alice');

    fireEvent.click(within(years).getByRole('button', { name: '2025' }));
    expect(screen.getByText('2명')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(2);
    expect(screen.queryByRole('heading', { name: 'carol' })).not.toBeInTheDocument();
    expectStatusCount('alice', 'Merged', 1);
    expectStatusCount('alice', 'In Review', 0);
    expectStatusCount('bob', 'Merged', 1);
    expectStatusCount('bob', 'Abandoned', 1);
    expect(screen.getByText('2025-06-01')).toBeInTheDocument();
    expect(screen.getByText('2025-05-01')).toBeInTheDocument();

    fireEvent.click(within(years).getByRole('button', { name: '전체' }));
    expect(screen.getByText('3명')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(3);
    expectStatusCount('alice', 'Merged', 1);
    expectStatusCount('alice', 'In Review', 1);
    expect(screen.getByText('2026-02-01')).toBeInTheDocument();
  });

  it('연도를 바꿔도 검색어와 정렬을 유지하고 해당 연도의 기여 수로 정렬한다', () => {
    (getAllContributions as jest.Mock).mockReturnValue([
      contribution('1', 'alice', '2025-06-01', 'merged'),
      contribution('2', 'alice', '2025-06-02', 'merged'),
      contribution('3', 'alice', '2026-01-01', 'merged'),
      contribution('4', 'bob', '2025-05-01', 'merged'),
      contribution('5', 'bob', '2026-02-01', 'merged'),
      contribution('6', 'bob', '2026-02-02', 'merged'),
    ]);
    render(<ContributorsPage />);
    fireEvent.change(screen.getByLabelText('정렬 기준'), { target: { value: 'total' } });
    expect(screen.getAllByRole('link')[0]).toHaveAttribute('href', '/contributors/bob');

    fireEvent.click(screen.getByRole('button', { name: '2025' }));
    expect(screen.getAllByRole('link')[0]).toHaveAttribute('href', '/contributors/alice');
    fireEvent.change(screen.getByRole('searchbox', { name: '기여자 검색' }), { target: { value: 'ALICE' } });
    fireEvent.click(screen.getByRole('button', { name: '2026' }));
    expect(screen.getByRole('searchbox', { name: '기여자 검색' })).toHaveValue('ALICE');
    expect(screen.getByLabelText('정렬 기준')).toHaveValue('total');
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/contributors/alice');
    expect(screen.getByRole('status')).toHaveTextContent('1 / 2명');
  });

  it('선택 연도에 기여자가 없어도 다른 연도를 선택할 수 있다', () => {
    (getAllContributions as jest.Mock).mockReturnValue([
      contribution('1', 'alice', '2025-06-01', 'merged'),
    ]);
    render(<ContributorsPage />);

    expect(screen.getByText('2026년 기여자가 아직 없습니다.')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '검색 초기화' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '2025' }));
    expect(screen.getByRole('heading', { name: 'alice' })).toBeInTheDocument();
  });

  it('기여자가 없으면 빈 상태를 표시한다', () => {
    (getAllContributions as jest.Mock).mockReturnValue([]);
    render(<ContributorsPage />);
    expect(screen.getByText('아직 기여자가 없습니다.')).toBeInTheDocument();
  });
});
