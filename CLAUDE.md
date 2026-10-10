# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # dev server — open http://localhost:3000/contributions/ (NOT /)
npm test               # Jest (jsdom)
npm test -- <pattern>  # single file/pattern, e.g. npm test -- ContributorRow.test
npm run lint           # next lint (ESLint)
npm run lint:md        # markdownlint-cli2 over data/**/*.md
npm run validate:data  # validate contribution frontmatter (scripts/validate-contributions.js)
npm run sync:contributions -- --dry-run # maintainer metadata refresh preview
npm run slides:render  # re-render slide deck previews (public/slides/*/preview, needs Chrome)
npm run slides:pdf     # export each deck to ./<slug>.pdf for sharing (git-ignored, needs Chrome)
npm run build          # static export to out/ (deploy runs via .github/workflows/deploy.yml on push to main)
```

CI (`.github/workflows/pr-checks.yml`, runs on PRs) executes, in order: `npm ci → test → lint → validate:data → lint:md → build`. Run the same locally before pushing.

## The basePath gotcha

`next.config.ts` sets `basePath: '/contributions'`, `trailingSlash: true`, and `output: 'export'`. Every route lives under `/contributions/...`:

- `http://localhost:3000/` → **404**
- `http://localhost:3000/foo` → **308** redirect
- `http://localhost:3000/contributions/` → **200**

Because it's a static export (GitHub Pages), there is no server at runtime: pages are prerendered at build time, and any sorting/filtering/search must happen in **client components** (`'use client'`), not via server queries.

## Architecture

**Data-driven static site.** Markdown under `data/` is the source of truth. `src/lib/*` loaders read it with `fs` + `gray-matter` at build time; `src/app/*` pages call the loaders and pass plain data into client view components that handle interactivity.

Three data domains:

| Domain               | Data                      | Loaders                                                              | Pages                                       |
| -------------------- | ------------------------- | -------------------------------------------------------------------- | ------------------------------------------- |
| Contributions        | `data/contributions/*.md` | `contributions.ts`, `contributors.ts`, `stats.ts`, `search-index.ts` | `/patches`, `/contributors`, `/stats`, home |
| Docs / guide         | `data/docs`              | `docs.ts`, `markdown.ts`                                             | `/docs`, `/guide`                           |
| Schedule (from #150) | `data/meetings`           | `meetings.ts`, `calendar.ts`, `periodColors.ts`                      | `/schedule`                                 |

Key flow: `getAllContributions()` (reads files, sorted by `date` desc) feeds `getContributorSummaries()`, `buildSearchIndex()`, and `computeStats()`. Pages are server components; `HomeView`, `ContributorsList`, `StatsView`, `ScheduleView`, etc. are client components that receive the pre-built data and do the sorting/filtering.

Slide decks are self-contained HTML at `public/slides/{slug}/index.html`,
linked from a meeting with `slides: /slides/{slug}/` and embedded by
`MeetingDetail`. A deck holds only slide markup; styles and behavior come
from `public/slides/_shared/deck.{css,js}`, whose tokens mirror
`globals.css`. After editing a
deck, run `npm run slides:render` and commit the regenerated `preview/*.png`
and `README.md` with it so reviewers can see the slides on GitHub.

Routing quirks: `/contributions` and `/guide` are Redirect stubs; the real lists live at `/patches` and `/docs`. `RootLayout` (`src/app/layout.tsx`) holds the header nav and theme bootstrap.

## Data conventions

Contribution frontmatter (see `data/contributions/template.md`): `title`,
`date` (the UTC date of Gerrit `created`, YYYY-MM-DD), `author` (GitHub
username), `contribution_url`, `module` (one stable area from
`src/lib/module-taxonomy.json`; detailed paths belong in `keywords`),
`kind` (single change type such as fix/feature/refactor/test/docs/cleanup),
`keywords` (ordered search-term array), and `status` (`in review` | `merged` |
`abandoned`). Copy `template.md` to `{ChromiumReviewId}.md`. New records start
`in review`; update status to `merged` or `abandoned` after the Gerrit result is
confirmed. Add optional `resolvedDate` only when the exact result date is
verified: UTC `submitted` for merged CLs or the last abandon event for
abandoned CLs, never `updated`. Independent GitHub PRs use UTC `created_at`
and `merged_at`. Never change `date` to the resolution date. Legacy `labels` values
were copied to `keywords` in their original order to preserve search terms;
new records use `keywords` without `labels`. Add optional `repo`, `issue`,
`crbug`, or `related` only when verified.

Contribution tables always display individual records in the supplied order.
Shared OSSCA assignment `issue` values and explicit `related` review IDs
populate related-patch links in details and connections in the graph. A
shared `crbug` alone does not connect records; umbrella bugs often span
unrelated assignments and authors. Keep `crbug` as a reference link in
patch details.

- `npm run validate:data` gates frontmatter in CI. A malformed `date` (e.g. a typo like `2025-05-D8`) parses to `NaN` and silently breaks date sorting — keep dates valid `YYYY-MM-DD`.
- `gray-matter` may hand back `date` as a `Date` object, so normalize with `new Date(c.date)` before comparing.
- `isValidGithubUsername` (`src/lib/github.ts`) gates whether a contributor links to a profile page; invalid handles render a fallback avatar with no link (the `[username]` route only `generateStaticParams` for valid handles).

Mentees author contribution Markdown; maintainers run `sync:contributions`
to refresh verified public review dates/status. Completion flags live in
`data/maintenance/contribution-sync.json`, never in mentee frontmatter.
Regular runs skip successfully finalized Merged records whose metadata
fingerprint still matches. `--force` checks all records; classification
changes are explicit decisions from the repository's
`.agents/skills/sync-contributions/SKILL.md`, supplied with
`--classification-file`. Dry runs never change records or completion flags.
Keep generated data/state updates separate from script changes and new
mentee contributions. Preserve authored bodies and `template.md`.

## Commit & workflow conventions

- **Use semantic-commit prefixes**, chosen by what changed:
  - Site code (`src/`, `scripts/`, config, tests — the GitHub Pages app): `feat:` / `fix:` / `refactor:` / `chore:` / `test:`
  - Contribution records (`data/contributions/**`): `contributions:`
  - Program data (other `data/**` — meeting notes, docs translations): `data:`
  - Repo docs (`README.md`, `CONTRIBUTING.md`, `CLAUDE.md`): `docs:`
  - After the prefix, keep the existing subject style: present-tense verb, capitalized, no trailing period, 72-column wrap, blank line after the subject. Examples: `feat: Add Google Analytics for production host`, `contributions: Add 6520751`, `data: Add meeting note 2026-07-25`.
- The "commit message rule" section in `CONTRIBUTING.md` (no semantic prefixes, Chromium style) applies to **Chromium Gerrit patches** (`git cl upload`), not to commits in this repo — do not apply it here.
- Fork-based flow: `upstream` = `OSSCA-chromium/contributions`; local `main` tracks `upstream/main`. Branch names use `YYMMDD-topic`. Push to `origin` (your fork) and open a PR against upstream `main`.
