import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import {
  getAllContributions,
  getAllContributionSlugs,
  getContributionBySlug,
} from '@/lib/contributions';
import { Metadata } from 'next';
import Link from 'next/link';
import AxisChip from '@/components/AxisChip';
import JourneyStepper from '@/components/JourneyStepper';
import PatchMeta from '@/components/PatchMeta';
import StatusBadge from '@/components/StatusBadge';
import { DEFAULT_REPO } from '@/components/PatchRow';
import { groupByRelated } from '@/lib/grouping';
import { isoDay } from '@/lib/years';
import type { Contribution } from '@/lib/types';

interface ParamsProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ParamsProps): Promise<Metadata> {
  const { slug } = await params;
  const contribution = await getContributionBySlug(slug);

  if (!contribution) {
    return {
      title: '컨트리뷰션을 찾을 수 없습니다',
    };
  }

  return {
    title: `${contribution.title} | OSSCA Chromium`,
    description: contribution.excerpt,
  };
}

// 정적 생성을 위한 경로 생성 함수
export function generateStaticParams() {
  return getAllContributionSlugs();
}

// Related patches come from the same connected-component grouping the list page
// uses, so a chain (A-B via crbug, B-C via `related`) shows the whole family
// here as well. No record links to another today, so this always returns [].
function relatedPatches(contribution: Contribution): Contribution[] {
  if (contribution.relatedSlugs.length === 0) return [];
  const row = groupByRelated(getAllContributions()).find(
    (r) => r.type === 'group' && r.items.some((i) => i.slug === contribution.slug)
  );
  if (!row || row.type !== 'group') return [];
  return row.items.filter((i) => i.slug !== contribution.slug);
}

function SideCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-m1">
      <h2 className="m-0 bg-m2 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
        {title}
      </h2>
      <div className="px-4 py-3.5">{children}</div>
    </section>
  );
}

export default async function PatchPage({ params }: ParamsProps) {
  const { slug } = await params;

  const contribution = await getContributionBySlug(slug);

  if (!contribution) {
    notFound();
  }

  const related = relatedPatches(contribution);

  return (
    // The mockup folds to a single column at <=900px, below Tailwind's `lg`,
    // so the two-column layout and the sticky sidebar both key off min-[901px].
    <div className="grid grid-cols-1 items-start gap-[26px] min-[901px]:grid-cols-[minmax(0,1fr)_288px] min-[901px]:gap-10">
      <article>
        <header className="mb-6 border-b border-mline pb-[18px]">
          <p className="mb-2.5 text-[13px] text-on-surface-variant">
            <Link href="/patches" className="text-primary hover:underline">
              기여 목록
            </Link>{' '}
            / <span className="font-mono">{contribution.slug}</span>
          </p>
          <h1 className="mb-3.5 text-[29px] font-bold leading-[1.3] tracking-[-0.025em]">
            {contribution.title}
          </h1>
          <div className="flex flex-wrap items-center gap-1.5">
            <AxisChip kind="module" value={contribution.module} />
            <AxisChip kind="kind" value={contribution.kind} />
            {contribution.repo !== DEFAULT_REPO && (
              <AxisChip kind="repo" value={contribution.repo} />
            )}
            <StatusBadge status={contribution.status} />
          </div>
        </header>

        {/* HTML Content */}
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: contribution.contentHtml ?? '' }}
        />

        {/* 다른 컨트리뷰션 목록으로 돌아가기 */}
        <div className="mt-8 border-t border-mline pt-6">
          <Link
            href="/patches"
            className="inline-flex items-center text-primary hover:underline"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            목록으로
          </Link>
        </div>
      </article>

      <aside className="grid gap-5 text-[13.5px] min-[901px]:sticky min-[901px]:top-[74px]">
        <SideCard title="기여 정보">
          <PatchMeta contribution={contribution} />
        </SideCard>

        <SideCard title="여정">
          <JourneyStepper contribution={contribution} />
        </SideCard>

        {related.length > 0 && (
          <SideCard title="연관 패치">
            {/* WebKit drops the list role when list-style is none. */}
            <ul role="list" className="m-0 list-none p-0">
              {related.map((item) => (
                <li
                  key={item.slug}
                  className="border-t border-mline py-2.5 first:border-t-0 first:pt-0"
                >
                  <Link
                    href={`/patches/${item.slug}`}
                    className="text-[13.5px] font-semibold text-on-surface hover:text-primary"
                  >
                    {item.title}
                  </Link>
                  <span className="mt-[3px] block text-[12px] text-on-surface-variant">
                    {isoDay(item.date)} · {item.author} ·{' '}
                    <span className="font-mono">{item.slug}</span>
                  </span>
                </li>
              ))}
            </ul>
          </SideCard>
        )}
      </aside>
    </div>
  );
}
