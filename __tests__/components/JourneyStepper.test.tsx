import { render, screen } from '@testing-library/react';
import JourneyStepper from '@/components/JourneyStepper';
import type { Contribution, ContributionStatus } from '@/lib/types';

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
  related: [],
  relatedSlugs: [],
  status: 'in review',
  excerpt: 'Browser peer connection coverage',
};

test.each([
  ['in review', 'IN REVIEW'],
  ['merged', 'MERGED'],
  ['abandoned', 'ABANDONED'],
] as [ContributionStatus, string][])('shows the upload stage and %s result status without inventing a result date', (status, label) => {
  render(<JourneyStepper contribution={{ ...contribution, status }} />);

  expect(screen.getByText('업로드일')).toBeInTheDocument();
  expect(screen.getByText('2026-05-08')).toBeInTheDocument();
  expect(screen.getByText('결과')).toBeInTheDocument();
  expect(screen.getByText(label)).toBeInTheDocument();
  expect(screen.queryByText('결과일')).not.toBeInTheDocument();
  expect(document.querySelector('time[datetime="2026-05-08"]')).toBeInTheDocument();
});

test('shows only an explicitly recorded resolvedDate as the result date', () => {
  render(<JourneyStepper contribution={{ ...contribution, status: 'merged', resolvedDate: '2026-06-02' }} />);

  expect(screen.getByText('2026-05-08')).toBeInTheDocument();
  expect(screen.getByText('결과일')).toBeInTheDocument();
  expect(screen.getByText('2026-06-02')).toBeInTheDocument();
  expect(document.querySelector('time[datetime="2026-06-02"]')).toBeInTheDocument();
});
