'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { createContributionGraph, layoutContributionGraph, type PositionedCloud } from '@/lib/contribution-graph';
import type { SearchIndexItem } from '@/lib/types';
import { CONTRIBUTION_STATUS_LABELS } from '@/lib/status-labels';
import ContributorAvatar from '@/components/ContributorAvatar';
import StatusBadge from '@/components/StatusBadge';

const COLORS: Record<string, string> = {
  merged: 'var(--chart-merged)', 'in review': 'var(--chart-in-review)',
  abandoned: 'var(--chart-abandoned)', unknown: 'var(--chart-unknown)',
};
const REASONS = { crbug: '공유 crbug', issue: '공유 과제 이슈', related: '연관 패치' };

function cloudPath(cloud: PositionedCloud) {
  const { x, y, width: w, height: h } = cloud;
  return `M ${x + w * .15} ${y + h * .88}
    C ${x - w * .02} ${y + h * .90}, ${x - w * .02} ${y + h * .45}, ${x + w * .12} ${y + h * .38}
    C ${x + w * .10} ${y + h * .08}, ${x + w * .30} ${y - h * .03}, ${x + w * .42} ${y + h * .12}
    C ${x + w * .57} ${y - h * .03}, ${x + w * .78} ${y + h * .02}, ${x + w * .82} ${y + h * .25}
    C ${x + w * 1.01} ${y + h * .24}, ${x + w * 1.04} ${y + h * .68}, ${x + w * .89} ${y + h * .85}
    C ${x + w * .72} ${y + h * 1.02}, ${x + w * .31} ${y + h * 1.01}, ${x + w * .15} ${y + h * .88} Z`;
}

export default function ContributionGraph({ items, compact = false }: { items: SearchIndexItem[]; compact?: boolean }) {
  const id = useId();
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1000);
  const [project, setProject] = useState('all');
  const [selectedSlug, setSelectedSlug] = useState('');
  const allGraph = useMemo(() => createContributionGraph(items), [items]);
  const activeProject = allGraph.projects.some(p => p.repo === project) ? project : 'all';
  const graph = useMemo(() => createContributionGraph(activeProject === 'all' ? items : items.filter(item => (item.repo?.trim() || 'chromium/src') === activeProject)), [items, activeProject]);
  const layout = useMemo(() => layoutContributionGraph(graph, width, compact), [graph, width, compact]);
  const points = useMemo(() => new Map(layout.nodes.map(node => [node.slug, node])), [layout]);
  const selected = points.get(selectedSlug);
  const neighbors = useMemo(() => graph.edges.flatMap(edge => {
    const slug = edge.source === selected?.slug ? edge.target : edge.target === selected?.slug ? edge.source : undefined;
    const node = slug ? points.get(slug) : undefined;
    return node ? [{ node, reason: edge.reason }] : [];
  }), [graph, selected, points]);
  const connected = new Set(neighbors.map(({ node }) => node.slug));

  useEffect(() => {
    if (!container.current) return;
    const element = container.current;
    const resize = () => setWidth(Math.max(240, element.getBoundingClientRect().width));
    resize();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section aria-labelledby={`${id}-title`} className="min-w-0 overflow-hidden rounded-2xl border border-mline bg-m1 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={`${id}-title`} className="section-title">프로젝트별 기여와 연결</h2>
          <p className="mt-1 text-sm text-on-surface-variant">구름은 프로젝트, 점은 패치, 선은 기록된 연관 관계입니다.</p>
        </div>
        {compact ? <Link href="/stats" className="text-sm font-medium text-link hover:underline">전체 그래프 →</Link> : (
          <label className="text-sm text-on-surface-variant">
            프로젝트
            <select aria-label="프로젝트 필터" value={activeProject} onChange={e => { setProject(e.target.value); setSelectedSlug(''); }} className="ml-2 rounded-full border border-mline bg-background px-3 py-2 text-on-surface">
              <option value="all">전체</option>
              {allGraph.projects.map(p => <option key={p.repo} value={p.repo}>{p.label} ({p.count})</option>)}
            </select>
          </label>
        )}
      </div>
      {graph.nodes.length === 0 ? <p className="mt-6 text-on-surface-variant">표시할 패치가 없습니다.</p> : (
        <>
          <div ref={container} className="mt-3 min-w-0">
            <svg viewBox={`0 0 ${width} ${layout.height}`} width="100%" role="group" aria-label="프로젝트별 패치 연관 그래프" className="block overflow-visible">
              {layout.clouds.map((cloud, i) => (
                <g key={cloud.repo} data-project={cloud.repo}>
                  <path d={cloudPath(cloud)} fill={`var(--c${Math.min(i + 2, 4)})`} fillOpacity=".22" stroke="var(--color-outline)" strokeWidth="1" />
                  <text x={cloud.x + cloud.width / 2} y={cloud.y + cloud.height * .24} textAnchor="middle" fill="var(--color-on-surface)" fontSize={width < 640 && i > 0 ? 12 : 16} fontWeight="600">
                    {cloud.label === 'DevTools frontend' && width < 640 ? <><tspan x={cloud.x + cloud.width / 2} dy="-5">DevTools</tspan><tspan x={cloud.x + cloud.width / 2} dy="15">frontend</tspan></> : cloud.label}
                  </text>
                  <text x={cloud.x + cloud.width / 2} y={cloud.y + cloud.height * (width < 640 && i > 0 ? .40 : .34)} textAnchor="middle" fill="var(--color-on-surface-variant)" fontSize="12">{cloud.count}건 · {Math.round(cloud.count / graph.nodes.length * 100)}%</text>
                </g>
              ))}
              <g aria-hidden="true">
                {graph.edges.map(edge => {
                  const a = points.get(edge.source)!; const b = points.get(edge.target)!;
                  const active = edge.source === selected?.slug || edge.target === selected?.slug;
                  return <line key={`${edge.source}:${edge.target}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={active ? 'var(--color-primary)' : 'var(--c2)'} strokeWidth={active ? 2 : 1} opacity={selected ? active ? .85 : .08 : .18} />;
                })}
              </g>
              {layout.nodes.map(node => {
                const active = selected?.slug === node.slug;
                return (
                  <g key={node.slug} role="button" tabIndex={0} aria-label={`패치 ${node.slug}: ${node.title}`} aria-pressed={active} className="graph-node cursor-pointer" onClick={() => setSelectedSlug(node.slug)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedSlug(node.slug); } }} opacity={selected && !active && !connected.has(node.slug) ? .35 : 1}>
                    <title>{`${node.title} · ${node.author} · ${node.date}`}</title>
                    <circle cx={node.x} cy={node.y} r="12" fill="transparent" />
                    <circle className="graph-dot" cx={node.x} cy={node.y} r={active ? 8 : 5.5} fill={COLORS[node.status || 'unknown']} stroke={active ? 'var(--color-primary)' : 'var(--color-background)'} strokeWidth={active ? 3 : 1.5} />
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-mline pt-3 text-xs text-on-surface-variant">
            <div className="flex flex-wrap gap-3">
              {Object.entries(CONTRIBUTION_STATUS_LABELS).filter(([key]) => graph.nodes.some(node => (node.status || 'unknown') === key)).map(([key, label]) => <span key={key} className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: COLORS[key] }} />{label}</span>)}
            </div>
            <p>연관 패치 {graph.relatedPatchCount}건 · 연결 {graph.edges.length}개</p>
          </div>
          <label className="mt-4 block text-sm text-on-surface-variant">
            패치 선택
            <select aria-label="패치 선택" value={selected?.slug || ''} onChange={event => setSelectedSlug(event.target.value)} className="mt-1 block w-full min-w-0 rounded-xl border border-mline bg-background px-3 py-2 text-on-surface">
              <option value="">점을 누르거나 목록에서 패치를 선택하세요</option>
              {graph.nodes.map(node => <option key={node.slug} value={node.slug}>{node.slug} · {node.title}</option>)}
            </select>
          </label>
          <div aria-live="polite" className="mt-3">
            {selected && <div className="rounded-xl border border-mline bg-background p-4">
              <div className="flex items-start gap-3">
                <ContributorAvatar username={selected.author} size={36} linkToProfile />
                <div className="min-w-0 flex-1">
                  <Link href={`/patches/${selected.slug}`} className="break-words font-semibold text-link hover:underline">{selected.title}</Link>
                  <p className="mt-1 text-xs text-on-surface-variant">{selected.date} · {selected.module || '기타'} · 리뷰 {selected.slug}</p>
                </div>
                {selected.status && <StatusBadge status={selected.status} />}
              </div>
              {neighbors.length ? <ul className="mt-3 space-y-2 border-t border-mline pt-3 text-sm">
                {neighbors.slice(0, compact ? 3 : neighbors.length).map(({ node, reason }) => <li key={node.slug} className="flex flex-wrap items-baseline gap-x-2"><span className="text-xs text-on-surface-variant">{REASONS[reason]}</span><Link href={`/patches/${node.slug}`} className="text-link hover:underline">{node.title}</Link></li>)}
              </ul> : <p className="mt-3 text-xs text-on-surface-variant">선택한 범위에 기록된 연관 패치가 없습니다.</p>}
            </div>}
          </div>
        </>
      )}
    </section>
  );
}
