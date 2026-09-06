import { fireEvent, render, screen } from '@testing-library/react';
import PatchTable from '@/components/PatchTable';

const patch = (over = {}) => ({
  slug: '8261422',
  title: 'FSA: Honor umask for saved files',
  date: '2026-08-28',
  author: 'zbnerd',
  contributionUrl: 'https://crrev.com/c/8261422',
  module: 'content',
  kind: 'fix',
  repo: 'chromium/src',
  status: 'merged' as const,
  relatedSlugs: [] as string[],
  ...over,
});

test('열 제목 행을 보여준다', () => {
  render(<PatchTable items={[patch()]} />);
  for (const head of ['날짜', '리뷰 ID', '제목', '작성자', '상태']) {
    expect(screen.getByText(head)).toBeInTheDocument();
  }
});

test('행이 제목·모듈·종류·상태를 보여주고 상세로 링크한다', () => {
  render(<PatchTable items={[patch()]} />);
  expect(
    screen.getByRole('link', { name: 'FSA: Honor umask for saved files' })
  ).toHaveAttribute('href', '/patches/8261422');
  expect(screen.getByText('content')).toBeInTheDocument();
  expect(screen.getByText('fix')).toBeInTheDocument();
  expect(screen.getByText('MERGED')).toBeInTheDocument();
  expect(screen.getByText('zbnerd')).toBeInTheDocument();
  expect(screen.getByText('2026-08-28')).toBeInTheDocument();
});

// 리뷰 ID만 crrev(외부)로 나가고, 행 전체가 아니라 제목만 상세로 링크한다.
test('리뷰 ID는 새 탭으로 여는 외부 링크다', () => {
  render(<PatchTable items={[patch()]} />);
  const external = screen.getByRole('link', { name: '8261422' });
  expect(external).toHaveAttribute('href', 'https://crrev.com/c/8261422');
  expect(external).toHaveAttribute('target', '_blank');
  expect(external).toHaveAttribute('rel', 'noopener noreferrer');
});

test('contribution_url이 없으면 리뷰 ID를 링크하지 않는다', () => {
  render(<PatchTable items={[patch({ contributionUrl: '' })]} />);
  expect(screen.queryByRole('link', { name: '8261422' })).not.toBeInTheDocument();
  expect(screen.getByText('8261422')).toBeInTheDocument();
});

test('repo가 기본값이면 repo 칩을 숨긴다', () => {
  const { unmount } = render(<PatchTable items={[patch()]} />);
  expect(screen.queryByText('chromium/src')).not.toBeInTheDocument();
  unmount();

  render(<PatchTable items={[patch({ repo: 'devtools/devtools-frontend' })]} />);
  expect(screen.getByText('devtools/devtools-frontend')).toBeInTheDocument();
});

test('연관 그룹에는 그룹 헤더와 건수가 보인다', () => {
  render(
    <PatchTable
      items={[
        patch({ slug: '1', title: '첫 패치', relatedSlugs: ['2'], crbug: 42 }),
        patch({ slug: '2', title: '둘째 패치', relatedSlugs: ['1'], crbug: 42 }),
      ]}
    />
  );
  expect(screen.getByText('연관 2건')).toBeInTheDocument();
  expect(screen.getByText('crbug 42')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'crbug 42' })).toHaveAttribute('href', 'https://crbug.com/42');
  expect(screen.getByRole('link', { name: '첫 패치' })).toHaveAttribute('href', '/patches/1');
  expect(screen.getByRole('link', { name: '둘째 패치' })).toHaveAttribute('href', '/patches/2');
});

test('큰 그룹은 최근 3건을 보여주고 전체 펼치기와 접기를 지원한다', () => {
  const items = Array.from({ length: 5 }, (_, i) => patch({
    slug: String(i + 1), title: `연관 패치 ${i + 1}`,
    relatedSlugs: ['1', '2', '3', '4', '5'].filter(slug => slug !== String(i + 1)),
    crbug: 42,
  }));
  render(<PatchTable items={[...items, patch({ slug: '6', title: '다른 패치' })]} />);
  expect(screen.getByRole('link', { name: '연관 패치 3' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: '연관 패치 4' })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: '다른 패치' })).toBeInTheDocument();
  const expand = screen.getByRole('button', { name: '전체 5건 펼치기' });
  expect(expand).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(expand);
  expect(screen.getByRole('link', { name: '연관 패치 5' })).toBeInTheDocument();
  const collapse = screen.getByRole('button', { name: '접기' });
  expect(collapse).toHaveAttribute('aria-expanded', 'true');
  fireEvent.click(collapse);
  expect(screen.queryByRole('link', { name: '연관 패치 4' })).not.toBeInTheDocument();
});

test('필터로 그룹이 작아지면 남은 패치를 모두 보여준다', () => {
  const items = Array.from({ length: 5 }, (_, i) => patch({
    slug: String(i + 1), title: `패치 ${i + 1}`, relatedSlugs: ['1', '2', '3', '4', '5'], crbug: 42,
  }));
  const { rerender } = render(<PatchTable items={items} />);
  fireEvent.click(screen.getByRole('button', { name: '전체 5건 펼치기' }));
  rerender(<PatchTable items={items.slice(3)} />);
  expect(screen.getByRole('link', { name: '패치 4' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '패치 5' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /펼치기|접기/ })).not.toBeInTheDocument();
});

test('연관이 없는 항목은 그룹 헤더 없이 렌더한다', () => {
  render(<PatchTable items={[patch({ slug: '1' }), patch({ slug: '2' })]} />);
  expect(screen.queryByText(/^연관 \d+건$/)).not.toBeInTheDocument();
});
