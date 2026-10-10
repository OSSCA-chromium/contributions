# Source evidence and input contracts

## Contributions snapshot

The public statistics page is `https://ossca-chromium.github.io/contributions/stats/`.
It filters by contribution Created year and counts registered frontmatter status;
it does not query Gerrit at runtime. Record the selected year and displayed counts.

Pin the Git revision corresponding to the deployed site. Do not assume the local
checkout or an older report is current. Public fetches need no API token; preserve
the user's branch and unrelated files. Use the selected report directory, which
defaults to `reports/ossca/<year>/<run-id>/`, and keep evidence in its `evidence/`
subdirectory. Honor a user-specified output location. Keep report artifacts out
of contribution Markdown.

Run from the Contributions repository root with its existing `gray-matter` dependency:

```bash
node .agents/skills/ossca-contribution-report/scripts/snapshot_site.mjs --repo <checkout> --ref <pinned-revision> \
  --year <YYYY> --output <report-directory>/evidence/snapshot
```

This reads Git objects without checking out or changing the branch. It writes
`site-records.json` and `snapshot.json` containing SHA, year, counts and check time.
Compare the snapshot with the rendered site before claiming site equivalence.
Source statuses remain authoritative for a site-based report.

## Exact review dates and project

```bash
python3 .agents/skills/ossca-contribution-report/scripts/verify_reviews.py \
  --records <report-directory>/evidence/snapshot/site-records.json \
  --output <report-directory>/evidence/reviews
```

This fetches anonymous public Gerrit/GitHub metadata and writes a manifest, raw
details, and `verified-site-records.json`. It enriches project, exact merge date,
source creation date, and WPT commit count while preserving archive status/date.
The manifest records status differences. A source Merged / site In Review record
stays In Review in site-based totals.

To reuse already verified files, repeat `--evidence-dir <directory>`. Add
`--cache-only` for an offline check. Cache age is not refreshed by reading it:
cached paths and the current processing time in the manifest do not certify a
new live check. Report the original evidence time separately. Cache identity is
checked against the review ID and GitHub repository. Nonempty manifest errors
mean the evidence set is incomplete; do not aggregate its successful subset as
the complete site inventory. For blocked authenticated data, use an approved
`collect <source>` output according to the user's collector rules, not a token.

Normalized records are an array with these fields:

| Field | Meaning |
| --- | --- |
| `id`, `url`, `author`, `date`, `status` | Archive identifier, canonical contribution link, GitHub ID, UTC Created date, registered status |
| `verifiedProject` | `chromium/src`, `v8/v8`, `devtools/devtools-frontend`, or `web-platform-tests/wpt` |
| `mergeEventAt` | Exact Gerrit `submitted` / GitHub `merged_at`; verified `resolvedDate` is also accepted |
| `commitCount` | Verified GitHub commit count for an independent WPT PR |
| `sourceReviewStatus`, `sourceCreatedAt` | Comparison evidence; never overwrite archive status/date just for the report |
| `duplicateOf` | Explicit original CL identifier for an export duplicate, excluded from primary totals |

Missing merge dates or WPT commit counts require evidence, not guesses. Existing
count JSON can be used without reconstructing source events when only changing
the table format or folding preprogram counts.

## crbug activities

Reusing a verified audit preserves account aliases, duplicate-report mapping,
restricted issues, attribution and exclusions. New audits use mentee identities
confirmed from their actual contributions and public issue event history or an
approved collector output. Current reporter/assignee search alone is incomplete
after reassignment. A mention or comment alone does not establish Reporting,
Assigned or Fixed.

The audit JSON contains `activities` plus its evidence metadata. Each activity:

```json
{
  "id": "123456789",
  "project": "Chromium",
  "kind": "assigned",
  "author": "mentee-github-id",
  "date": "2026-09-01T10:00:00Z",
  "automaticOnFix": false,
  "cl": null,
  "url": "https://issues.chromium.org/issues/123456789"
}
```

- `kind` is `reported`, `assigned`, or `fixed`.
- Reporting uses the creation event and verified reporter, including confirmed
  account aliases. Refiled duplicate reports count once under the canonical ID.
- Assigned uses the event at which the mentee became assignee, including earlier
  assignments later changed to someone else. Distinguish assignment while open
  from automatic assignment at Fixed; preserve `automaticOnFix`.
- Fixed needs a mentee-linked fixing CL or verified event-time ownership. A later
  fix by another contributor is not the mentee's Fixed achievement.
- Map project using the actual fix repository when available; a DevTools symptom
  can be fixed by V8. A Chromium WPT export keeps its original crbug attribution.
- Restricted or unverified issues are excluded from Issue/role counts with a
  recorded reason. An independently verified CL still counts as a contribution.
- Issue is a unique-ID union. Activity roles and periods can overlap, so do not
  impose `Issue = Reporting + Assigned + Fixed` or force period sums to equal the
  annual unique total.

`report.py` preserves the full audit in `crbugEvidence`. If preprogram Issue
activity overlaps Challenges, raw events are required to recompute the union;
scalar counts alone cannot establish it.

## Comparison and presentation

Resolve discrepancies using year/program scope, new registrations, snapshot
revision, archive/source status differences, duplicate exports and missing repo
metadata. Never silently switch all statuses to live Gerrit while calling the
report site-based.

Table cells use concise labels/counts; surrounding Korean report prose uses
습니다. Include only the requested sections in the clipboard. Statistics can
include In Review and Abandoned even when the separate achievement list contains
only merged patches. Chart averages use the explicitly selected cohort, ordinarily
contributors with records rather than the initial mentee selection count.
