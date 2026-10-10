#!/usr/bin/env python3
"""Draw a horizontal mentee chart and optional status/monthly companion charts."""
import argparse
from collections import Counter
import csv
from pathlib import Path
import json


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--counts', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--year', type=int, help='Required if the input has no year metadata')
    parser.add_argument('--as-of', help='Required if the input has no snapshot date metadata')
    parser.add_argument('--font', type=Path, help='Korean-capable font file')
    args = parser.parse_args()
    data = json.loads(args.counts.read_text())
    rows = sorted(data['menteeContributionCounts'], key=lambda r: (-r['total'], r['author'].lower()))
    total = data['counts']['Unique total']['Pull Request']['Total']
    year = args.year or data.get('year')
    as_of = args.as_of or data.get('asOf') or data.get('checkedDateKST')
    if not year or not as_of or not rows:
        parser.error('Nonempty mentee counts, --year and --as-of (or input metadata) are required')
    if total != sum(r['total'] for r in rows) or len({r['author'] for r in rows}) != len(rows):
        parser.error('Mentee counts do not reconcile with the unique total')
    if any(r['total'] != sum(r[k] for k in ['merged', 'inReview', 'abandoned']) for r in rows):
        parser.error('Mentee status counts do not reconcile')
    mean = total / len(rows)

    import matplotlib
    matplotlib.use('Agg')
    from matplotlib import font_manager
    import matplotlib.pyplot as plt
    from matplotlib.lines import Line2D
    from matplotlib.ticker import MaxNLocator
    font = args.font
    apple = Path('/System/Library/Fonts/Supplemental/AppleGothic.ttf')
    if font is None and apple.is_file():
        font = apple
    if font:
        font_manager.fontManager.addfont(str(font))
        family = font_manager.FontProperties(fname=str(font)).get_name()
    else:
        names = {f.name for f in font_manager.fontManager.ttflist}
        family = next((n for n in ['Noto Sans CJK KR', 'Noto Sans KR', 'NanumGothic'] if n in names), None)
        if family is None:
            parser.error('Provide --font with a Korean-capable font file')
    plt.rcParams.update({'font.family': family, 'axes.unicode_minus': False, 'svg.fonttype': 'path', 'font.size': 12})
    colors = {'merged': '#34a853', 'inReview': '#4285f4', 'abandoned': '#80868b'}
    labels = {'merged': 'Merged', 'inReview': 'In Review', 'abandoned': 'Abandoned'}
    args.output.mkdir(parents=True, exist_ok=True)

    def save(fig, name):
        for suffix in ['png', 'svg']:
            fig.savefig(args.output / f'{name}.{suffix}', dpi=200, facecolor='white')
        plt.close(fig)

    fig, ax = plt.subplots(figsize=(14, max(6, 3 + len(rows) * 0.4)))
    fig.text(0.035, 0.965, f'{year}년 멘티별 기여 수', fontsize=24, color='#182230', va='top')
    fig.text(0.035, 0.91, f'총 {total}건 · 멘티 {len(rows)}명 · 1인당 평균 {mean:.2f}건', fontsize=16, va='top')
    left = [0] * len(rows)
    for key in colors:
        values = [r[key] for r in rows]
        ax.barh(range(len(rows)), values, left=left, color=colors[key], height=0.68, label=labels[key])
        left = [a + b for a, b in zip(left, values)]
    ax.axvline(mean, color='#c06a13', linestyle=(0, (5, 4)), linewidth=1.7, zorder=4)
    largest = max(r['total'] for r in rows)
    for i, row in enumerate(rows):
        ax.text(row['total'] + max(largest * 0.012, 0.3), i, str(row['total']), va='center', fontsize=13,
                zorder=5, bbox={'facecolor': 'white', 'edgecolor': 'none', 'pad': 1.2})
    ax.set_yticks(range(len(rows)), [r['author'] for r in rows], fontsize=13)
    ax.invert_yaxis()
    ax.set_xlim(0, max(largest * 1.14, 2))
    ax.set_xlabel('기여 수 (건)', labelpad=12)
    ax.xaxis.set_major_locator(MaxNLocator(integer=True, nbins=6))
    ax.grid(axis='x', color='#e4e9f1')
    ax.set_axisbelow(True)
    ax.tick_params(axis='both', length=0, pad=7)
    for spine in ax.spines.values():
        spine.set_visible(False)
    handles, names = ax.get_legend_handles_labels()
    handles.append(Line2D([0], [0], color='#c06a13', linestyle=(0, (5, 4)), linewidth=1.7))
    names.append(f'평균 {mean:.2f}건')
    fig.legend(handles, names, loc='upper left', bbox_to_anchor=(0.17, 0.865), frameon=False, ncol=4)
    fig.text(0.035, 0.03, f'Contributions 사이트 등록 기록 · {as_of} 조회 기준\nMerged·In Review·Abandoned 포함 · 기여 기록이 있는 멘티 기준', fontsize=10.5, color='#64748b', linespacing=1.7)
    fig.subplots_adjust(left=0.2, right=0.96, top=0.82, bottom=0.13)
    save(fig, 'mentee-contributions-horizontal')

    monthly = data.get('monthlyCreated')
    if monthly:
        if sum(monthly.values()) != total:
            parser.error('Monthly counts do not reconcile with the unique total')
        status = Counter()
        for row in rows:
            for key in colors:
                status[key] += row[key]
        fig, axes = plt.subplots(1, 2, figsize=(14, 6))
        fig.text(0.035, 0.94, f'{year}년 기여 현황과 활동 흐름', fontsize=23)
        fig.text(0.035, 0.88, f'Contributions 사이트 기준 · {as_of} 조회', fontsize=12, color='#64748b')
        wedges, _ = axes[0].pie([status[k] for k in colors], colors=list(colors.values()), startangle=90,
                                 counterclock=False, wedgeprops={'width': 0.28, 'edgecolor': 'white'})
        axes[0].text(0, 0.05, str(total), ha='center', va='center', fontsize=31)
        axes[0].text(0, -0.2, '전체 기여', ha='center', va='center', fontsize=12, color='#64748b')
        axes[0].set_title('상태 분포', loc='left', fontsize=17, pad=13)
        axes[0].legend(wedges, [f'{labels[k]}  {status[k]}건 · {status[k]/total*100:.1f}%' for k in colors],
                       loc='center left', bbox_to_anchor=(0.92, 0.5), frameon=False, fontsize=11)
        months = sorted(monthly)
        bars = axes[1].bar(range(len(months)), [monthly[m] for m in months], color='#4285f4', width=0.6)
        axes[1].bar_label(bars, padding=5, fontsize=12)
        axes[1].set_xticks(range(len(months)), [f'{int(m[5:])}월' for m in months])
        axes[1].set_ylim(0, max(monthly.values()) * 1.22)
        axes[1].set_title('월별 제출 수', loc='left', fontsize=17, pad=13)
        axes[1].yaxis.set_major_locator(MaxNLocator(integer=True, nbins=4))
        axes[1].grid(axis='y', color='#e4e9f1')
        axes[1].set_axisbelow(True)
        axes[1].tick_params(axis='both', length=0)
        for spine in axes[1].spines.values():
            spine.set_visible(False)
        fig.text(0.035, 0.045, f'사이트의 Created 날짜 기준입니다. {as_of[:7]}은 {as_of} 조회 시점까지의 실적입니다.', fontsize=11, color='#64748b')
        fig.subplots_adjust(left=0.055, right=0.97, top=0.75, bottom=0.19, wspace=0.55)
        save(fig, 'status-and-monthly-contributions')
    with (args.output / 'mentee-contributions.csv').open('w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['author', 'total', 'merged', 'inReview', 'abandoned'])
        writer.writeheader()
        writer.writerows(rows)
    print(json.dumps({'total': total, 'mentees': len(rows), 'average': mean, 'monthlyChart': bool(monthly)}, ensure_ascii=False))


if __name__ == '__main__':
    main()
