import { render, screen } from '@testing-library/react';
import JourneyStepper from '@/components/JourneyStepper';

// Every real record today has neither `issue` nor `crbug` (verified: zero of
// the 62 files in data/contributions carry either key), so browsing the site
// only ever exercises the 2-step path. These tests are the sole verification
// of the 4-step path — do not delete them because "the page looks fine".
// The slug deliberately contains no "42": the crbug test matches a link by
// /42/ and the Gerrit step's "CL {slug}" must not collide with it.
const base = {
  slug: '8264335',
  contributionUrl: 'https://crrev.com/c/8264335',
  repo: 'chromium/src',
  date: '2026-08-28',
  status: 'merged' as const,
};

test('issue와 crbug가 없으면 Gerrit과 결과 2단계만 렌더한다', () => {
  render(<JourneyStepper contribution={base} />);
  expect(screen.getAllByRole('listitem')).toHaveLength(2);
  expect(screen.queryByText('이슈')).not.toBeInTheDocument();
});

test('issue와 crbug가 있으면 4단계를 순서대로 렌더한다', () => {
  render(<JourneyStepper contribution={{ ...base, issue: 341, crbug: 527515380 }} />);
  const steps = screen.getAllByRole('listitem');
  expect(steps).toHaveLength(4);
  expect(steps[0]).toHaveTextContent('이슈');
  expect(steps[1]).toHaveTextContent('crbug');
  expect(steps[2]).toHaveTextContent('Gerrit');
  expect(steps[3]).toHaveTextContent('결과');
});

test('결과 단계는 상태에 따라 문구가 바뀐다', () => {
  render(<JourneyStepper contribution={{ ...base, status: 'abandoned' }} />);
  expect(screen.getByText('중단됨')).toBeInTheDocument();
});

// The dot palette depends on how many steps were built, so the 4-step colours
// are as unbrowsable as the 4-step markup: last --c1, the one before --c2, the
// rest --c3.
test('점 색은 단계 수에 따라 마지막부터 c1·c2·c3 순으로 매겨진다', () => {
  const dots = (el: HTMLElement) =>
    Array.from(el.querySelectorAll('span[aria-hidden]'))
      .map((n) => n.className)
      .filter((c) => c.includes('rounded-full'))
      .map((c) => (c.match(/bg-c\d/) ?? [''])[0]);

  const two = render(<JourneyStepper contribution={base} />);
  expect(dots(two.container)).toEqual(['bg-c2', 'bg-c1']);
  two.unmount();

  const four = render(
    <JourneyStepper contribution={{ ...base, issue: 341, crbug: 527515380 }} />
  );
  expect(dots(four.container)).toEqual(['bg-c3', 'bg-c3', 'bg-c2', 'bg-c1']);
});

test('crbug와 issue 링크가 새 탭으로 열린다', () => {
  render(<JourneyStepper contribution={{ ...base, crbug: 42 }} />);
  const link = screen.getByRole('link', { name: /42/ });
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
});
