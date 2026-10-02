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
  ['in review', 'In Review'],
  ['merged', 'Merged'],
  ['abandoned', 'Abandoned'],
] as [ContributionStatus, string][])('shows Created and %s status without inventing a Closed date', (status, label) => {
  render(<JourneyStepper contribution={{ ...contribution, status }} />);

  expect(screen.getByText('Created')).toBeInTheDocument();
  expect(screen.getByText('2026-05-08')).toBeInTheDocument();
  expect(screen.getByText('진행 상태')).toBeInTheDocument();
  expect(screen.getByText(label)).toBeInTheDocument();
  expect(screen.queryByText('Closed')).not.toBeInTheDocument();
  expect(document.querySelector('time[datetime="2026-05-08"]')).toBeInTheDocument();
});

test('shows only an explicitly recorded resolvedDate as Closed', () => {
  render(<JourneyStepper contribution={{ ...contribution, status: 'merged', resolvedDate: '2026-06-02' }} />);

  expect(screen.getByText('2026-05-08')).toBeInTheDocument();
  expect(screen.getByText('Closed')).toBeInTheDocument();
  expect(screen.getByText('2026-06-02')).toBeInTheDocument();
  expect(document.querySelector('time[datetime="2026-06-02"]')).toBeInTheDocument();
});
