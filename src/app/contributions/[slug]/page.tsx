import Redirect from '@/components/Redirect';
import { getAllContributionSlugs } from '@/lib/contributions';

export function generateStaticParams() {
  return getAllContributionSlugs();
}

export const metadata = { robots: { index: false } };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Redirect to={`/contributions/patches/${slug}/`} />;
}
