import { isoDay } from '@/lib/years';
import type { Contribution, ContributionStatus } from '@/lib/types';

export type JourneyItem = Pick<
  Contribution,
  'slug' | 'contributionUrl' | 'repo' | 'date' | 'issue' | 'crbug' | 'status'
>;

const RESULT: Record<ContributionStatus, string> = {
  merged: '머지됨',
  abandoned: '중단됨',
  'in review': '리뷰 진행 중',
};

type Step = { label: string; title: string; href?: string; sub?: string };

// The stepper is variable length: issue and crbug are optional frontmatter, so
// a patch walks two, three, or four stations. No real record carries either key
// today, which is why JourneyStepper.test.tsx — not the rendered site — is the
// proof that the longer paths work.
function buildSteps(c: JourneyItem): Step[] {
  const steps: Step[] = [];

  if (c.issue !== undefined) {
    steps.push({
      label: '이슈',
      title: `과제 이슈 #${c.issue}`,
      href: `https://github.com/OSSCA-chromium/contributions/issues/${c.issue}`,
      sub: 'OSSCA-chromium/contributions',
    });
  }
  if (c.crbug !== undefined) {
    steps.push({
      label: 'crbug',
      title: `Issue ${c.crbug}`,
      href: `https://issues.chromium.org/issues/${c.crbug}`,
      sub: 'issues.chromium.org',
    });
  }
  steps.push({
    label: 'Gerrit 리뷰',
    title: `CL ${c.slug}`,
    href: c.contributionUrl || undefined,
    sub: c.repo,
  });
  steps.push({
    label: '결과',
    // status is required by validate:data; undefined only means a malformed
    // record slipped past, and guessing "머지됨" there would be a lie.
    title: (c.status && RESULT[c.status]) || '상태 미상',
    sub: isoDay(c.date),
  });

  return steps;
}

// Dots run pale to strong toward the outcome — last step --c1, the one before
// it --c2, everything earlier --c3. The connector into the final step is --c1
// as well (the mockup's :nth-last-child(2) rule) so the approach to the result
// reads as one solid run; earlier connectors stay --c3.
const dotColor = (i: number, n: number) =>
  i === n - 1 ? 'bg-c1' : i === n - 2 ? 'bg-c2' : 'bg-c3';
const trackColor = (i: number, n: number) => (i === n - 2 ? 'bg-c1' : 'bg-c3');

export default function JourneyStepper({ contribution }: { contribution: JourneyItem }) {
  const steps = buildSteps(contribution);
  const last = steps.length - 1;

  return (
    // WebKit drops the list role when list-style is none, so the role is explicit.
    <ol role="list" className="m-0 list-none p-0">
      {steps.map((step, i) => (
        <li key={step.label} className={`relative pl-[34px] ${i === last ? '' : 'pb-[22px]'}`}>
          <span
            className={`absolute left-0 top-px h-[23px] w-[23px] rounded-full ${dotColor(i, steps.length)}`}
            aria-hidden="true"
          />
          {i !== last && (
            <span
              className={`absolute bottom-0 left-[9px] top-[27px] w-[5px] rounded-[5px] ${trackColor(i, steps.length)}`}
              aria-hidden="true"
            />
          )}
          <span className="block text-[11px] font-semibold uppercase tracking-[0.07em] text-on-surface-variant">
            {step.label}
          </span>
          <span className="mt-0.5 block text-[13.5px] font-semibold">
            {step.href ? (
              <a
                href={step.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {step.title}
              </a>
            ) : (
              step.title
            )}
          </span>
          {step.sub && (
            <span className="mt-1 block text-[12.5px] leading-[1.5] text-on-surface-variant">
              {step.sub}
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
