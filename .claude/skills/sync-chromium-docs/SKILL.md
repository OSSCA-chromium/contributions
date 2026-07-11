---
name: sync-chromium-docs
description: Use when a Chromium doc translation must appear on the docs site (/docs), when translation source notes changed and data/docs is stale, or when asked to sync or add translated Chromium docs (번역 동기화). Covers scripts/sync-chromium-docs.js and its MANIFEST.
---

# Sync: translated Chromium docs → data/docs

`scripts/sync-chromium-docs.js` converts full Korean translations of Chromium docs (kept in a local translations folder, outside this repo) into site pages under `data/docs/`. The script's **MANIFEST is the source of truth** — a translation not listed there is never synced.

## Source folder contract

The translations folder (CLI argument or `CHROMIUM_DOCS_DIR` env var) holds one file per doc:

- Filename: `Chromium - <original title>.md` — the filename minus the prefix is shown as the original title next to the Korean one
- Frontmatter MUST have `source_path` (repo-root path inside chromium/src); `source_sha256` / `translation_status` are carried through
- Body: full translation. The first `# H1` becomes the page title, `[TOC]` lines are dropped, and repo-internal links are rewritten to googlesource / raw.githubusercontent URLs

## Adding a new doc

1. Confirm the translated file exists in the source folder with `source_path` frontmatter.
2. Add a MANIFEST entry in `scripts/sync-chromium-docs.js`:
   - `slug` — kebab-case output name (`data/docs/<slug>.md`)
   - `order` — keep docs from the same source folder **contiguous**: insert into that folder's block and renumber every later entry (+1). The sidebar (`DocsSidebar.tsx`) derives group order from first appearance in the order-sorted list, so scattered orders misplace groups.
   - `description` — one line for the docs index card
   - `title` — only when the translated H1 is too long for the sidebar
   - `originalTitle` — only when the real original title differs from the filename (filename-hostile chars like `:`, or a title such as `Visual Studio Code Dev` shortened for the filename)
3. Run the sync and verify (below).

## Run

```bash
node scripts/sync-chromium-docs.js <translations-dir>
# or: CHROMIUM_DOCS_DIR=<translations-dir> node scripts/sync-chromium-docs.js
```

Every MANIFEST entry is rewritten on each run — when renumbering, expect order-only diffs across all synced files.

## Verify

```bash
git status        # only data/docs/*.md listed in MANIFEST (+ the script) changed
npm run lint:md   # markdownlint over data/**
npm test
```

Spot-check the new `data/docs/<slug>.md`: frontmatter (title / order / group / description / source_path), the source-link blockquote at the top, and that relative links became absolute googlesource URLs. To see it rendered, use the run-contributions skill and open `/contributions/docs/<slug>/`.

## Gotchas

| Trap                                                     | Reality                                                                                        |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Editing a translated `data/docs/*.md` by hand            | The next sync silently overwrites it — fix the translation source or the script instead        |
| Translation exists but never appears on the site         | It is not in MANIFEST; the script only syncs listed entries                                    |
| Group shows up in the wrong sidebar spot                 | Group position = first appearance in the order-sorted list; keep same-folder orders contiguous |
| `source_path 없음` error                                 | The source note lacks `source_path` frontmatter                                                |
| Non-translated guides (order ≤ 19, e.g. getting-started) | Never touched by the script — hand-maintained                                                  |
