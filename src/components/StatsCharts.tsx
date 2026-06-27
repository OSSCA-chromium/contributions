'use client';

import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Stats } from '@/lib/types';

const STATUS_COLORS: Record<string, string> = {
  merged: 'var(--chart-merged)',
  'in review': 'var(--chart-in-review)',
  draft: 'var(--chart-draft)',
  unknown: 'var(--chart-unknown)',
};

const STATUS_LABELS: Record<string, string> = {
  merged: 'Merged',
  'in review': 'In Review',
  draft: 'Draft',
  unknown: '기타',
};

const BAR_COLOR = 'var(--chart-bar)';

export default function StatsCharts({ stats }: { stats: Stats }) {
  const statusData = stats.byStatus.map((s) => ({
    name: STATUS_LABELS[s.status] ?? s.status,
    value: s.count,
    key: s.status,
  }));

  const topContributors = stats.topContributors.slice(0, 10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 상태 분포 */}
      <div className="bg-surface border border-outline rounded-lg p-4">
        <h3 className="text-lg font-semibold text-on-surface mb-4">상태 분포</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {statusData.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={STATUS_COLORS[entry.key] ?? BAR_COLOR}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 월별 추이 */}
      <div className="bg-surface border border-outline rounded-lg p-4">
        <h3 className="text-lg font-semibold text-on-surface mb-4">월별 추이</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.byMonth}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" name="기여 수" fill={BAR_COLOR} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 기여자 랭킹 (Top 10) */}
      <div className="bg-surface border border-outline rounded-lg p-4 lg:col-span-2">
        <h3 className="text-lg font-semibold text-on-surface mb-4">
          기여자 랭킹 (Top 10)
        </h3>
        <div style={{ height: Math.max(topContributors.length * 36, 120) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topContributors}
              layout="vertical"
              margin={{ left: 24 }}
            >
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="username"
                width={120}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Bar dataKey="count" name="기여 수" fill={BAR_COLOR} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
