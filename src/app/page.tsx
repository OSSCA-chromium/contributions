import { getAllContributions } from '@/lib/contributions';
import { buildSearchIndex } from '@/lib/search-index';
import HomeView from '@/components/HomeView';

export default function Home() {
  const items = buildSearchIndex(getAllContributions());
  return (
    <div className="mx-auto max-w-7xl p-4">
      <HomeView items={items} />
    </div>
  );
}
