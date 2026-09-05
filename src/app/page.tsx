import { getAllContributions } from '@/lib/contributions';
import { buildSearchIndex } from '@/lib/search-index';
import HomeView from '@/components/HomeView';

export default function Home() {
  const items = buildSearchIndex(getAllContributions());
  return <HomeView items={items} />;
}
