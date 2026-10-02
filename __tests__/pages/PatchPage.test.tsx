import { render, screen, within } from '@testing-library/react';
import PatchPage from '@/app/patches/[slug]/page';
import { getAllContributions, getContributionBySlug } from '@/lib/contributions';
import type { Contribution } from '@/lib/types';

jest.mock('@/lib/contributions', () => ({
  getAllContributions: jest.fn(),
  getAllContributionSlugs: jest.fn(),
  getContributionBySlug: jest.fn(),
}));
jest.mock('@/components/MermaidRenderer', () => ({
  __esModule: true,
  default: ({ containerId }: { containerId: string }) => <span data-testid="mermaid" data-container={containerId} />,
}));

const contribution: Contribution = {
  slug: '123', title: 'Fix rendering', date: '2026-10-01', author: 'alice',
  contributionUrl: 'https://crrev.com/c/123', module: 'blink', kind: 'fix',
  keywords: [], labels: [], related: [124], relatedSlugs: ['124'],
  status: 'merged', excerpt: 'Rendering fix',
  contentHtml: '<p>Patch retrospective</p><pre><code class="hljs language-mermaid">graph TD; A--&gt;B;</code></pre>',
};

test('detail sidebar shows metadata, related patches, and the current journey semantics', async () => {
  (getContributionBySlug as jest.Mock).mockResolvedValue({ ...contribution, relatedSlugs: [] });
  (getAllContributions as jest.Mock).mockReturnValue([
    contribution,
    { ...contribution, slug: '124', title: 'Related rendering fix', related: [123], relatedSlugs: ['123'] },
  ]);
  render(await PatchPage({ params: Promise.resolve({ slug: '123' }) }));

  const sidebar = screen.getByRole('complementary');
  expect(within(sidebar).getByRole('heading', { name: '기여 정보' })).toBeInTheDocument();
  expect(within(sidebar).getByRole('link', { name: 'Related rendering fix' })).toHaveAttribute('href', '/patches/124');
  expect(within(sidebar).getByRole('link', { name: 'Gerrit 리뷰 123' })).toHaveAttribute('href', 'https://crrev.com/c/123');
  const journey = within(sidebar).getByRole('list', { name: '패치 진행 여정' });
  expect(within(journey).getByText('Created')).toBeInTheDocument();
  expect(within(journey).queryByText('Closed')).not.toBeInTheDocument();
  expect(screen.getByText('Patch retrospective')).toBeInTheDocument();
  expect(screen.getByTestId('mermaid')).toHaveAttribute('data-container', 'patch-content-123');
  expect(document.getElementById('patch-content-123')).toContainElement(screen.getByText('Patch retrospective'));
});
