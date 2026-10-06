#!/usr/bin/env python3
"""Enrich public source evidence without replacing archive statuses or dates."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import json
from pathlib import Path
import re
from urllib.parse import urlsplit
from urllib.request import Request, urlopen


def source(url):
    parsed = urlsplit(url)
    if parsed.hostname in ['crrev.com', 'chromium-review.googlesource.com']:
        match = re.search(r'(?:/c/|/\+/)(\d+)(?:/|$)', parsed.path)
        if not match:
            raise ValueError(f'Unsupported Gerrit URL: {url}')
        number = match.group(1)
        return 'gerrit', number, f'https://chromium-review.googlesource.com/changes/{number}/detail?o=CURRENT_REVISION&o=CURRENT_COMMIT&o=CURRENT_FILES'
    if parsed.hostname == 'github.com':
        match = re.fullmatch(r'/([^/]+)/([^/]+)/pull/(\d+)/?', parsed.path)
        if match:
            owner, repo, number = match.groups()
            return 'github', f'{owner}--{repo}--{number}', f'https://api.github.com/repos/{owner}/{repo}/pulls/{number}'
    raise ValueError(f'Unsupported public review URL: {url}')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--records', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--evidence-dir', type=Path, action='append', default=[])
    parser.add_argument('--cache-only', action='store_true', help='Reject uncached sources without network requests')
    args = parser.parse_args()
    records = json.loads(args.records.read_text())
    checked = datetime.now(timezone.utc).isoformat()

    def fetch(row):
        try:
            kind, key, url = source(row['url'])
            candidates = [f'{key}.json', f'{key}.detail.json', f'gerrit-{key}.json']
            if kind == 'github':
                candidates.append('wpt-' + key.rsplit('--', 1)[-1] + '.json')
            detail = None
            evidence_path = None
            for folder in args.evidence_dir:
                for name in candidates:
                    path = folder / name
                    if path.is_file():
                        detail = json.loads(path.read_text())
                        evidence_path = str(path)
                        break
                if detail is not None:
                    break
            if detail is None:
                if args.cache_only:
                    raise ValueError(f'No cached evidence for {row["id"]}')
                request = Request(url, headers={'User-Agent': 'OSSCA-public-contribution-report', 'Accept': 'application/json'})
                with urlopen(request, timeout=30) as response:
                    content = response.read().decode('utf-8')
                if content.startswith(")]}'"):
                    content = content.split('\n', 1)[1]
                detail = json.loads(content)
            result = dict(row)
            if kind == 'gerrit':
                if str(detail.get('_number')) != key:
                    raise ValueError('Cached Gerrit review ID mismatch')
                result.update(verifiedProject=detail['project'], sourceReviewStatus=detail['status'].lower().replace('new', 'in review'),
                              sourceCreatedAt=detail['created'])
                if detail.get('submitted'):
                    result['mergeEventAt'] = detail['submitted']
            else:
                owner, repo, number = key.split('--')
                if str(detail.get('number')) != number or urlsplit(detail.get('html_url', '')).path.lower() != f'/{owner}/{repo}/pull/{number}'.lower():
                    raise ValueError('Cached GitHub PR identity mismatch')
                status = 'merged' if detail['merged_at'] else 'abandoned' if detail['state'] == 'closed' else 'in review'
                result.update(verifiedProject=f'{owner}/{repo}', sourceReviewStatus=status,
                              sourceCreatedAt=detail['created_at'], commitCount=detail['commits'])
                if detail['merged_at']:
                    result['mergeEventAt'] = detail['merged_at']
            return {'record': result, 'id': row['id'], 'url': url,
                    'cachedEvidence': evidence_path, 'detail': detail}
        except Exception as error:
            return {'id': row.get('id'), 'error': str(error)}

    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(fetch, records))
    args.output.mkdir(parents=True, exist_ok=True)
    errors = [r for r in results if 'error' in r]
    enriched = [r['record'] for r in results if 'record' in r]
    for item in results:
        if 'detail' in item:
            (args.output / (str(item['id']) + '.json')).write_text(json.dumps(item['detail'], ensure_ascii=False, indent=2) + '\n')
    (args.output / 'verified-site-records.json').write_text(json.dumps(enriched, ensure_ascii=False, indent=2) + '\n')
    manifest = {'checkedAt': checked, 'requestedRecords': len(records), 'verifiedRecords': len(enriched),
                'records': [{k: v for k, v in r.items() if k not in ['record', 'detail']} for r in results],
                'errors': errors, 'statusDifferences': [
                    {'id': r['id'], 'site': r['status'], 'source': r['sourceReviewStatus']}
                    for r in enriched if r['status'] != r['sourceReviewStatus']]}
    (args.output / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({k: manifest[k] for k in ['requestedRecords', 'verifiedRecords', 'errors', 'statusDifferences']}, ensure_ascii=False))
    if errors:
        parser.exit(2, 'Public evidence incomplete; inspect manifest.json before reporting totals.\n')


if __name__ == '__main__':
    main()
