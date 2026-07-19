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
npm run build          # static export to out/
npm run deploy         # build + publish out/ to gh-pages
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
| Docs / guide         | `data/docs`, `data/guide` | `docs.ts`, `markdown.ts`                                             | `/docs`, `/guide`                           |
| Schedule (from #150) | `data/meetings`           | `meetings.ts`, `calendar.ts`, `attendance.ts`, `periodColors.ts`     | `/schedule`                                 |

Key flow: `getAllContributions()` (reads files, sorted by `date` desc) feeds `getContributorSummaries()`, `buildSearchIndex()`, and `computeStats()`. Pages are server components; `HomeView`, `ContributorsList`, `StatsView`, `ScheduleView`, etc. are client components that receive the pre-built data and do the sorting/filtering.

Routing quirks: `/contributions` and `/guide` are Redirect stubs; the real lists live at `/patches` and `/docs`. `RootLayout` (`src/app/layout.tsx`) holds the header nav and theme bootstrap.

## Data conventions

Contribution frontmatter (see `data/contributions/template.md`): `title`, `date` (YYYY-MM-DD), `author` (GitHub username), `contribution_url`, `labels` (array), `status` (`in review` | `merged` | `draft`). Copy `template.md` to `{ChromiumReviewId}.md`.

- `npm run validate:data` gates frontmatter in CI. A malformed `date` (e.g. a typo like `2025-05-D8`) parses to `NaN` and silently breaks date sorting — keep dates valid `YYYY-MM-DD`.
- `gray-matter` may hand back `date` as a `Date` object, so normalize with `new Date(c.date)` before comparing.
- `isValidGithubUsername` (`src/lib/github.ts`) gates whether a contributor links to a profile page; invalid handles render a fallback avatar with no link (the `[username]` route only `generateStaticParams` for valid handles).

## Commit & workflow conventions

- **Use semantic-commit prefixes**, chosen by what changed:
  - Site code (`src/`, `scripts/`, config, tests — the GitHub Pages app): `feat:` / `fix:` / `refactor:` / `chore:` / `test:`
  - Program data (`data/**` — contributions, meeting notes, docs translations): `data:`
  - Repo docs (`README.md`, `CONTRIBUTING.md`, `CLAUDE.md`): `docs:`
  - After the prefix, keep the existing subject style: present-tense verb, capitalized, no trailing period, 72-column wrap, blank line after the subject. Examples: `feat: Add Google Analytics for production host`, `data: Add contribution 6721390`.
- The "commit message rule" section in `CONTRIBUTING.md` (no semantic prefixes, Chromium style) applies to **Chromium Gerrit patches** (`git cl upload`), not to commits in this repo — do not apply it here.
- Fork-based flow: `upstream` = `OSSCA-chromium/contributions`; local `main` tracks `upstream/main`. Branch names use `YYMMDD-topic`. Push to `origin` (your fork) and open a PR against upstream `main`.
