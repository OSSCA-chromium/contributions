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
- Body: full translation. The first `# H1` becomes the page title, `[TOC]` lines are dropped, repo-internal links — inline `[x](path)` AND reference definitions `[label]: path` — are rewritten to googlesource / raw.githubusercontent URLs, and the vault footer (`원문:`/`원문 링크:`/`## 원문` block + `## History`) is stripped
- In-document anchors (`[x](#...)`) MUST target the **translated** heading slugs: heading ids come from the Korean text (`## 설정` → `#설정`), so original-doc anchors like `#setup` point nowhere. Exception: a heading carrying an explicit gitiles anchor (`## 제목 {#custom-id}`) keeps that id — leave anchors to it unchanged

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

The script prints `⚠ <slug>: 깨진 문서 내 앵커 #...` for any in-document anchor that matches no heading id. A clean run has zero warnings; fix reported anchors in the translation source note (never in `data/docs/`) and re-run.

## Verify

```bash
git status        # only data/docs/*.md listed in MANIFEST (+ the script) changed
npm run lint:md   # markdownlint over data/**
npm test
```

Spot-check the new `data/docs/<slug>.md`: frontmatter (title / order / group / description / source_path), the source-link blockquote at the top, that relative links became absolute googlesource URLs, no vault footer (`원문`/`## History`) at the bottom, and the sync run printed no `⚠` anchor warnings. To see it rendered, use the run-contributions skill and open `/contributions/docs/<slug>/`.

## Gotchas

| Trap                                                     | Reality                                                                                                                          |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Editing a translated `data/docs/*.md` by hand            | The next sync silently overwrites it — fix the translation source or the script instead                                          |
| Translation exists but never appears on the site         | It is not in MANIFEST; the script only syncs listed entries                                                                      |
| Group shows up in the wrong sidebar spot                 | Group position = first appearance in the order-sorted list; keep same-folder orders contiguous                                   |
| `source_path 없음` error                                 | The source note lacks `source_path` frontmatter                                                                                  |
| Non-translated guides (order ≤ 19, e.g. getting-started) | Never touched by the script — hand-maintained                                                                                    |
| Anchor works on gitiles but not on the site              | Original English anchor survived translation — rewrite it to the translated heading slug in the source note (`#setup` → `#설정`) |
| Sync prints `⚠ 깨진 문서 내 앵커`                       | An anchor matches no heading id — fix the translation source note and re-run; a clean sync has zero warnings                     |
