'use client';

import { useId, type ReactNode } from 'react';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Stats } from '@/lib/types';
import { CONTRIBUTION_STATUS_LABELS as STATUS_LABELS } from '@/lib/status-labels';
import ContributorAvatar from '@/components/ContributorAvatar';
import { getModuleLabel } from '@/lib/modules';

const STATUS_COLORS: Record<string, string> = {
  merged: 'var(--chart-merged)', 'in review': 'var(--chart-in-review)',
  abandoned: 'var(--chart-abandoned)', unknown: 'var(--chart-unknown)',
};
const STATUS_ORDER = ['merged', 'in review', 'abandoned'];
const STATUS_PRIORITY = new Map(STATUS_ORDER.map((status, index) => [status, index]));
const TOOLTIP_STYLE = {
  backgroundColor: 'var(--color-background)', border: '1px solid var(--color-outline)',
  borderRadius: 12, color: 'var(--color-on-surface)',
};

function ChartPanel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const id = useId();
  return <section aria-labelledby={id} className="min-w-0 rounded-2xl border border-mline bg-m1 p-4 sm:p-6">
    <h2 id={id} className="section-title">{title}</h2>
    <p className="mt-1 mb-5 text-sm text-on-surface-variant">{description}</p>
    {children}
  </section>;
}

export default function StatsCharts({ stats }: { stats: Stats }) {
  const statusData = [...stats.byStatus]
    .sort((a, b) => (STATUS_PRIORITY.get(a.status) ?? STATUS_ORDER.length) - (STATUS_PRIORITY.get(b.status) ?? STATUS_ORDER.length))
    .map(s => ({ name: STATUS_LABELS[s.status] || s.status, value: s.count, key: s.status }));
  const topContributors = stats.topContributors.slice(0, 10);
  const rankingStatuses = [...STATUS_ORDER];
  if (topContributors.some(contributor => contributor.byStatus.some(entry => entry.status === 'unknown'))) rankingStatuses.push('unknown');
  const topModules = stats.byModule.slice(0, 10);
  const share = (count: number) => Math.round(count / Math.max(stats.total, 1) * 100);

  return (
    <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
      <ChartPanel title="상태 분포" description="선택한 기간의 패치 처리 현황">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative h-60 w-full min-w-0 sm:w-1/2" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart accessibilityLayer={false}>
                <Pie rootTabIndex={-1} data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="58%" outerRadius="85%" paddingAngle={2} stroke="var(--color-background)">
                  {statusData.map(entry => <Cell key={entry.key} fill={STATUS_COLORS[entry.key] || 'var(--c2)'} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <b className="text-2xl tabular-nums">{stats.total}</b>
              <span className="text-xs text-on-surface-variant">전체 패치</span>
            </div>
          </div>
          <ul className="w-full space-y-4 sm:w-1/2" aria-label="상태별 기여 수">
            {statusData.map(entry => <li key={entry.key}>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[entry.key] }} />{entry.name}</span>
                <span className="whitespace-nowrap font-semibold tabular-nums">{entry.value}건 · {share(entry.value)}%</span>
              </div>
            </li>)}
          </ul>
        </div>
      </ChartPanel>

      <ChartPanel title="월별 추이" description="Created 날짜를 기준으로 집계">
        <div className="h-64 min-w-0" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart accessibilityLayer={false} data={stats.byMonth} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-on-surface-variant)' }} tickFormatter={month => `${month.slice(2, 4)}.${month.slice(5)}`} axisLine={false} tickLine={false} minTickGap={16} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--color-on-surface-variant)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'var(--color-surface-variant)' }} />
              <Bar dataKey="count" name="기여 수" fill="var(--c2)" radius={[6, 6, 0, 0]} maxBarSize={56} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer font-medium text-link">월별 수치 보기</summary>
          <table aria-label="월별 기여 수" className="mt-3 w-full text-left text-on-surface-variant">
            <thead><tr className="border-b border-mline"><th className="py-2 font-medium">월</th><th className="py-2 text-right font-medium">기여 수</th></tr></thead>
            <tbody>{stats.byMonth.map(month => <tr key={month.month} className="border-b border-mline"><td className="py-2">{month.month}</td><td className="py-2 text-right tabular-nums">{month.count}</td></tr>)}</tbody>
          </table>
        </details>
      </ChartPanel>

      <ChartPanel title="기여자 랭킹" description={`기여 수 기준 상위 ${topContributors.length}명 · 프로필 사진을 누르면 상세 보기`}>
        <ul aria-label="기여자 랭킹 상태 범례" className="mb-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-on-surface-variant">
          {rankingStatuses.map(status => <li key={status} className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[status] }} />
            {STATUS_LABELS[status]}
          </li>)}
        </ul>
        <ol className="space-y-4" aria-label="기여자별 기여 수">
          {topContributors.map((contributor, index) => {
            const segments = rankingStatuses.map(status => ({ status, count: contributor.byStatus.find(entry => entry.status === status)?.count ?? 0 }));
            const breakdown = segments.map(segment => `${STATUS_LABELS[segment.status]} ${segment.count}건`).join(' · ');
            return <li key={contributor.username} className="flex items-center gap-3" aria-label={`${contributor.username} 기여 ${contributor.count}건 · ${breakdown}`}>
              <span className="w-5 text-sm tabular-nums text-on-surface-variant">{index + 1}</span>
              <ContributorAvatar username={contributor.username} size={40} linkToProfile />
              <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-m3" aria-hidden="true" title={breakdown}>
                <div className="flex h-full overflow-hidden rounded-full" style={{ width: `${contributor.count / (topContributors[0]?.count || 1) * 100}%` }}>
                  {segments.filter(segment => segment.count > 0).map(segment => <div key={segment.status} className="h-full shrink-0" title={`${STATUS_LABELS[segment.status]} ${segment.count}건`} style={{ width: `${segment.count / Math.max(contributor.count, 1) * 100}%`, background: STATUS_COLORS[segment.status] }} />)}
                </div>
              </div>
              <span className="w-12 text-right text-sm font-semibold tabular-nums">{contributor.count}건</span>
            </li>;
          })}
        </ol>
      </ChartPanel>

      <ChartPanel title="모듈 분포" description={`전체 ${stats.moduleCount}개 모듈 중 기여 수 상위 ${topModules.length}개`}>
        <ol className="space-y-4" aria-label="모듈별 기여 수">
          {topModules.map(module => <li key={module.module}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 break-words font-medium" title={getModuleLabel(module.module)}>{getModuleLabel(module.module)}</span>
              <span className="shrink-0 text-xs tabular-nums text-on-surface-variant">{module.count}건 · {share(module.count)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-m3" aria-hidden="true"><div className="h-full rounded-full bg-c2" style={{ width: `${share(module.count)}%` }} /></div>
          </li>)}
        </ol>
      </ChartPanel>
    </div>
  );
}
