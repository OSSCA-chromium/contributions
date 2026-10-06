#!/usr/bin/env python3
"""Build five project tables from a verified archive snapshot or count payload."""
import argparse
from collections import Counter
from copy import deepcopy
import csv
from datetime import date
from html import escape
import json
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit


PROJECTS = {'Chromium': 'chromium/src', 'V8': 'v8/v8',
            'WPT': 'web-platform-tests/wpt', 'DevTools': 'devtools/devtools-frontend'}
METRICS = ['Pull Request', 'Merge', 'Commit', 'Issue',
           'Issue Reporting', 'Issue Assigned', 'Issue Fixed']
ROLES = {'reported': 'Issue Reporting', 'assigned': 'Issue Assigned', 'fixed': 'Issue Fixed'}
STAGES = ['Before', 'Challenges', 'Masters', 'After']
LABELS = {'Before': '프로그램 이전', 'Challenges': 'Challenges',
          'Masters': 'Masters', 'After': '프로그램 이후'}


def day(value):
    if not isinstance(value, str):
        raise ValueError(f'Expected an ISO date string, got {value!r}')
    return date.fromisoformat(value[:10]).isoformat()


def aggregate(records, audit, *, year, start, challenges_end, masters_end, as_of):
    start, challenges_end, masters_end, as_of = map(day, [start, challenges_end, masters_end, as_of])
    if not start <= challenges_end < masters_end or int(start[:4]) != year:
        raise ValueError('Invalid program period boundaries')
    if int(as_of[:4]) != year:
        raise ValueError('as-of and year must refer to the same snapshot year')

    def stage(value):
        value = day(value)
        return ('Before' if value < start else 'Challenges' if value <= challenges_end
                else 'Masters' if value <= masters_end else 'After')

    def tally(values):
        counter = Counter(stage(value) for value in values)
        return {'Total': len(values), **{s: counter[s] for s in STAGES}}

    unique = {}
    exports = []
    for original in records:
        if original.get('duplicateOf'):
            exports.append(deepcopy(original))
            continue
        row = deepcopy(original)
        created = day(row['date'])
        if int(created[:4]) != year or created > as_of:
            continue
        repo = row.get('verifiedProject') or row.get('repo')
        if repo not in PROJECTS.values():
            raise ValueError(f'Unknown project for {row.get("id")}: {repo!r}')
        if row['status'] not in ['merged', 'in review', 'abandoned']:
            raise ValueError(f'Unknown archive status: {row["status"]}')
        url = urlsplit(row['url'])
        if url.scheme not in ['https', 'http'] or not url.hostname:
            raise ValueError('Missing canonical public contribution URL')
        key = urlunsplit((url.scheme, url.netloc.lower(), url.path.rstrip('/'), '', ''))
        row['verifiedProject'] = repo
        row['date'] = created
        if repo == PROJECTS['WPT']:
            if not isinstance(row.get('commitCount'), int) or row['commitCount'] < 1:
                raise ValueError(f'Missing verified WPT commit count for {row.get("id")}')
        else:
            row['commitCount'] = 1
        if row['status'] == 'merged':
            resolved = row.get('mergeEventAt') or row.get('resolvedDate')
            if not resolved:
                raise ValueError(f'Missing verified merge date for {row.get("id")}')
            row['mergeEventAt'] = day(resolved)
            if not created <= row['mergeEventAt'] <= as_of:
                raise ValueError(f'Invalid merge date for {row.get("id")}')
        if key in unique:
            fields = ['date', 'status', 'author', 'verifiedProject', 'mergeEventAt']
            if any(unique[key].get(k) != row.get(k) for k in fields):
                raise ValueError(f'Conflicting duplicate contribution: {key}')
        else:
            unique[key] = row
    selected = list(unique.values())
    authors = {r['author'] for r in selected}
    activities = []
    issue_projects = {}
    seen_events = set()
    for activity in audit.get('activities', []):
        event_day = day(activity['date'])
        if int(event_day[:4]) != year or event_day > as_of:
            continue
        if activity['author'] not in authors:
            raise ValueError(f'crbug author absent from archive cohort: {activity["author"]}')
        if activity['project'] not in PROJECTS or activity['kind'] not in ROLES:
            raise ValueError('Unknown crbug project or activity kind')
        issue_id = str(activity['id'])
        if issue_projects.setdefault(issue_id, activity['project']) != activity['project']:
            raise ValueError(f'Conflicting project attribution for issue {issue_id}')
        key = tuple(str(activity.get(k)) for k in ['id', 'project', 'kind', 'author', 'date'])
        if key not in seen_events:
            activities.append(deepcopy(activity))
            seen_events.add(key)

    def issue_counts(events):
        result = {}
        for metric in ['Issue', *ROLES.values()]:
            relevant = [a for a in events if metric == 'Issue' or ROLES[a['kind']] == metric]
            result[metric] = {'Total': len({str(a['id']) for a in relevant}),
                             **{s: len({str(a['id']) for a in relevant if stage(a['date']) == s}) for s in STAGES}}
        return result

    def counts(rows, events):
        submitted = tally([r['date'] for r in rows])
        return {'Pull Request': submitted,
                'Merge': tally([r['mergeEventAt'] for r in rows if r['status'] == 'merged']),
                'Commit': tally([r['date'] for r in rows for _ in range(r['commitCount'])]),
                **issue_counts(events)}

    result = {'Unique total': counts(selected, activities)}
    for project, repo in PROJECTS.items():
        result[project] = counts([r for r in selected if r['verifiedProject'] == repo],
                                 [a for a in activities if a['project'] == project])
    people = []
    for author in authors:
        rows = [r for r in selected if r['author'] == author]
        statuses = Counter(r['status'] for r in rows)
        people.append({'author': author, 'total': len(rows), 'merged': statuses['merged'],
                       'inReview': statuses['in review'], 'abandoned': statuses['abandoned']})
    people.sort(key=lambda r: (-r['total'], r['author'].lower()))
    payload = {
        'year': year, 'asOf': as_of, 'periods': {'start': start, 'challengesEnd': challenges_end, 'mastersEnd': masters_end},
        'counts': result, 'menteeContributionCounts': people,
        'averageContributions': len(selected) / len(authors) if authors else None,
        'statusTotals': {s: sum(r['status'] == s for r in selected) for s in ['merged', 'in review', 'abandoned']},
        'monthlyCreated': dict(sorted(Counter(r['date'][:7] for r in selected).items())),
        'crbugEvidence': deepcopy(audit), 'selectedCrbugActivities': activities,
        'exportDuplicatesExcluded': exports,
        'issuePeriodNote': 'Unique issues can occur in both periods; activity counts are not additive.',
        'commitDefinition': 'One Gerrit CL equals one logical submitted commit; independent WPT PRs use verified GitHub commit counts.',
    }
    validate_counts(payload)
    return payload


def validate_counts(payload):
    counts = payload['counts']
    for name in ['Unique total', *PROJECTS]:
        for metric in METRICS:
            row = counts[name][metric]
            if any(not isinstance(v, int) or v < 0 for v in row.values()):
                raise ValueError(f'Invalid count: {name} / {metric}')
            if metric in METRICS[:3] and row['Total'] != sum(row.get(s, 0) for s in STAGES):
                raise ValueError(f'Non-additive patch count: {name} / {metric}')
            if any(row.get(s, 0) > row['Total'] for s in STAGES):
                raise ValueError(f'Period count exceeds total: {name} / {metric}')
    for metric in METRICS:
        for column in ['Total', *STAGES]:
            if sum(counts[p][metric].get(column, 0) for p in PROJECTS) != counts['Unique total'][metric].get(column, 0):
                raise ValueError(f'Project totals do not reconcile: {metric} / {column}')


def fold_preprogram(payload, policy):
    result = deepcopy(payload)
    if policy not in ['separate', 'challenges']:
        raise ValueError('preprogram policy must be separate or challenges')
    if policy == 'challenges':
        for project, metrics in result['counts'].items():
            for metric, row in metrics.items():
                before = row.pop('Before', 0)
                if before and metric in METRICS[3:]:
                    if 'selectedCrbugActivities' not in result:
                        raise ValueError('Preprogram issue activity requires raw-event regrouping')
                    events = [a for a in result['selectedCrbugActivities']
                              if (project == 'Unique total' or a['project'] == project)
                              and (metric == 'Issue' or ROLES[a['kind']] == metric)
                              and day(a['date']) <= result['periods']['challengesEnd']]
                    row['Challenges'] = len({str(a['id']) for a in events})
                else:
                    row['Challenges'] = row.get('Challenges', 0) + before
    result['preprogramPolicy'] = policy
    validate_counts(result)
    return result


def render_tables(payload):
    columns = ['Challenges', 'Masters']
    if payload.get('preprogramPolicy', 'separate') == 'separate':
        columns.insert(0, 'Before')
    if any(row.get('After', 0) for metrics in payload['counts'].values() for row in metrics.values()):
        columns.append('After')
    headers = ['항목', '총 합계', *[LABELS[c] for c in columns]]
    html = ['<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>OSSCA 실적</title></head><body>']
    text = []
    for label, key in [('전체 합계', 'Unique total'), *[(p, p) for p in PROJECTS]]:
        html.append('<h3>' + escape(label) + '</h3><table><thead><tr>' + ''.join('<th>' + escape(h) + '</th>' for h in headers) + '</tr></thead><tbody>')
        text.extend(['### ' + label, '', '| ' + ' | '.join(headers) + ' |', '| ' + ' | '.join('---' for _ in headers) + ' |'])
        for metric in METRICS:
            counts = payload['counts'][key][metric]
            cells = [metric, str(counts['Total']), *[str(counts.get(c, 0)) for c in columns]]
            html.append('<tr>' + ''.join('<td>' + escape(c) + '</td>' for c in cells) + '</tr>')
            text.append('| ' + ' | '.join(cells) + ' |')
        html.append('</tbody></table>')
        text.append('')
    html.append('</body></html>')
    return '\n'.join(html) + '\n', '\n'.join(text) + '\n'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--records', type=Path, help='Verified normalized site records JSON')
    group.add_argument('--counts', type=Path, help='Existing verified count payload; preserve its evidence')
    parser.add_argument('--crbug', type=Path, help='Verified crbug audit JSON; required with --records')
    parser.add_argument('--snapshot', type=Path, help='Pinned snapshot metadata JSON, optional with --records')
    parser.add_argument('--year', type=int)
    parser.add_argument('--as-of')
    parser.add_argument('--challenges-start')
    parser.add_argument('--challenges-end')
    parser.add_argument('--masters-end')
    parser.add_argument('--preprogram', choices=['separate', 'challenges'], default='separate')
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    try:
        if args.counts:
            payload = json.loads(args.counts.read_text())
            if any(getattr(args, k) is not None for k in ['crbug', 'snapshot', 'year', 'as_of', 'challenges_start', 'challenges_end', 'masters_end']):
                parser.error('--counts preserves scope and crbug data; use --records to rebuild')
        else:
            required = ['crbug', 'year', 'as_of', 'challenges_start', 'challenges_end', 'masters_end']
            if any(getattr(args, key) is None for key in required):
                parser.error('--records requires --crbug, --year, --as-of and all program boundaries')
            payload = aggregate(json.loads(args.records.read_text()), json.loads(args.crbug.read_text()),
                                year=args.year, start=args.challenges_start, challenges_end=args.challenges_end,
                                masters_end=args.masters_end, as_of=args.as_of)
            if args.snapshot:
                metadata = json.loads(args.snapshot.read_text())
                payload['snapshot'] = metadata
                payload['sourceCommit'] = metadata.get('sha')
        validate_counts(payload)
        payload = fold_preprogram(payload, args.preprogram)
        html, text = render_tables(payload)
        args.output.mkdir(parents=True, exist_ok=True)
        (args.output / 'notion-project-tables.html').write_text(html)
        (args.output / 'notion-project-tables.md').write_text(text)
        (args.output / 'verified-counts.json').write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n')
        with (args.output / 'project-counts.csv').open('w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['Project', 'Metric', 'Total', *STAGES])
            for project in ['Unique total', *PROJECTS]:
                for metric in METRICS:
                    row = payload['counts'][project][metric]
                    writer.writerow([project, metric, row['Total'], *[row.get(s, 0) for s in STAGES]])
        print(json.dumps({'tables': 5, 'preprogram': args.preprogram,
                          'total': payload['counts']['Unique total'], 'output': str(args.output)}, ensure_ascii=False))
    except (ValueError, KeyError) as error:
        parser.exit(2, f'Invalid report evidence: {error}\n')


if __name__ == '__main__':
    main()
