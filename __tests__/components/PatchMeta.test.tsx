import { render, screen } from '@testing-library/react';
import PatchMeta from '@/components/PatchMeta';

const base = {
  slug: '8261422',
  date: '2026-08-28',
  author: 'zbnerd',
  contributionUrl: 'https://crrev.com/c/8261422',
  module: 'content',
  kind: 'fix',
  repo: 'chromium/src',
  status: 'merged' as const,
};

test('모든 메타 행의 라벨과 값을 보여준다', () => {
  render(<PatchMeta contribution={base} />);
  for (const label of ['작성자', '날짜', '모듈', '종류', '저장소', '리뷰 ID', '상태']) {
    expect(screen.getByText(label)).toBeInTheDocument();
  }
  expect(screen.getByText('2026-08-28')).toBeInTheDocument();
  expect(screen.getByText('content')).toBeInTheDocument();
  expect(screen.getByText('fix')).toBeInTheDocument();
  expect(screen.getByText('chromium/src')).toBeInTheDocument();
  expect(screen.getByText('MERGED')).toBeInTheDocument();
});

// gray-matter hands back an unquoted YAML date as a Date object.
test('Date 객체로 들어온 날짜도 YYYY-MM-DD로 보여준다', () => {
  render(
    <PatchMeta
      contribution={{ ...base, date: new Date('2026-08-28') as unknown as string }}
    />
  );
  expect(screen.getByText('2026-08-28')).toBeInTheDocument();
});

test('리뷰 ID는 crrev로 나가는 새 탭 링크다', () => {
  render(<PatchMeta contribution={base} />);
  const link = screen.getByRole('link', { name: '8261422' });
  expect(link).toHaveAttribute('href', 'https://crrev.com/c/8261422');
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('rel', 'noopener noreferrer');
});

test('contribution_url이 없으면 리뷰 ID를 링크하지 않는다', () => {
  render(<PatchMeta contribution={{ ...base, contributionUrl: '' }} />);
  expect(screen.queryByRole('link', { name: '8261422' })).not.toBeInTheDocument();
  expect(screen.getByText('8261422')).toBeInTheDocument();
});

test('작성자가 유효한 GitHub 사용자명이면 컨트리뷰터 페이지로 링크한다', () => {
  render(<PatchMeta contribution={base} />);
  expect(screen.getByRole('link', { name: 'zbnerd' })).toHaveAttribute(
    'href',
    '/contributors/zbnerd'
  );
});

test('작성자가 유효하지 않으면 링크 없이 이름만 보여준다', () => {
  render(<PatchMeta contribution={{ ...base, author: '익명 기여자' }} />);
  expect(screen.queryByRole('link', { name: '익명 기여자' })).not.toBeInTheDocument();
  expect(screen.getByText('익명 기여자')).toBeInTheDocument();
});
