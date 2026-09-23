import { render, screen } from '@testing-library/react';
import PatchMeta from '@/components/PatchMeta';
import type { Contribution } from '@/lib/types';

const contribution: Contribution = {
  slug: '1012345',
  title: 'Set up WebRTC tests',
  date: '2026-05-08',
  author: 'alice',
  contributionUrl: 'https://crrev.com/c/1012345',
  module: 'blink/renderer',
  kind: 'test',
  keywords: ['webrtc'],
  labels: ['browser-tests'],
  repo: 'devtools/devtools-frontend',
  related: [],
  relatedSlugs: [],
  status: 'in review',
  excerpt: 'Browser peer connection coverage',
};

test('detail metadata labels the Gerrit date as upload date', () => {
  render(<PatchMeta contribution={contribution} />);

  expect(screen.getByText('업로드일')).toBeInTheDocument();
  expect(screen.getByText('2026-05-08')).toBeInTheDocument();
  expect(screen.queryByText('결과일')).not.toBeInTheDocument();
});

test('detail metadata shows author, taxonomy, optional repository, review ID, and status', () => {
  render(<PatchMeta contribution={contribution} />);

  expect(screen.getByRole('link', { name: 'alice' })).toHaveAttribute(
    'href',
    '/contributors/alice'
  );
  expect(screen.getByText('모듈')).toBeInTheDocument();
  expect(screen.getByText('blink/renderer')).toBeInTheDocument();
  expect(screen.getByText('종류')).toBeInTheDocument();
  expect(screen.getByText('test')).toBeInTheDocument();
  expect(screen.getByText('저장소')).toBeInTheDocument();
  expect(screen.getByText('devtools/devtools-frontend')).toBeInTheDocument();
  expect(screen.getByText('리뷰 ID')).toBeInTheDocument();
  expect(screen.getByText('1012345')).toBeInTheDocument();
  expect(screen.getByText('IN REVIEW')).toBeInTheDocument();
});

test('default Chromium repository is omitted from detail metadata', () => {
  const chromiumContribution: Contribution = { ...contribution, repo: 'chromium/src' };
  render(<PatchMeta contribution={chromiumContribution} />);

  expect(screen.queryByText('저장소')).not.toBeInTheDocument();
  expect(screen.queryByText('chromium/src')).not.toBeInTheDocument();
});
