---
name: run-contributions
description: Run, start, launch, or smoke-test the OSSCA Chromium contributions site (Next.js static-export app). Use when asked to run the app, start the dev server, verify a route renders, build, or smoke-test the site. Handles the /contributions basePath gotcha.
---

# Run: contributions (OSSCA Chromium)

Next.js 15 (app router) **static-export** site deployed to GitHub Pages. There is no GUI to click — it's driven headless via the **dev server + `curl` smoke**: routes are verified with an HTTP status + content check. Paths below are relative to the repo root.

## ⚠️ The one thing that trips everyone up: basePath

`next.config.ts` sets `basePath: '/contributions'` and `trailingSlash: true`. So on the dev server:

- `http://localhost:3000/` → **404**
- `http://localhost:3000/contributors` → **308** redirect
- `http://localhost:3000/contributions/` → **200** ✅

**Every URL lives under `/contributions/`.** Forget this and every curl looks broken.

## Prerequisites

```bash
npm ci
```

## Run (agent path) — smoke test

The committed harness launches the dev server, waits for it, curls the home route, checks content, then stops the server:

```bash
./.claude/skills/run-contributions/smoke.sh
```

Expected tail:

```
home HTTP: 200
OSSCA Chromium Contributions
Smoke OK.
```

If port 3000 is already taken (another dev server running), pass a free port — the script forwards it to `next dev`:

```bash
PORT=3100 ./.claude/skills/run-contributions/smoke.sh
```

## Verify a specific route (ad hoc)

```bash
npm run dev -- -p 3100 &
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/contributions/stats/
curl -s http://localhost:3100/contributions/ | grep -o "OSSCA Chromium Contributions"
kill %1
```

Key routes (all under `/contributions/`): `/contributions/` (home), `/contributions/patches/` (list), `/contributions/stats/`, `/contributions/docs/`.

## Run (human path)

```bash
npm run dev
# then open http://localhost:3000/contributions/   (NOT http://localhost:3000/)
```

## Build / test / lint

```bash
npm run build   # static export to out/ ; route table marks ○ (static) / ● (SSG)
npm test        # jest
npm run lint    # next lint
```

## Gotchas

- **basePath `/contributions`** (see top) — the #1 surprise. `/` 404s; always use the prefix.
- **`output: 'export'`** — `npm run build` writes a static site to `out/`. The deploy path is static hosting (GitHub Pages), not `npm run start`.
- **Port drift** — `next dev` defaults to 3000 and silently bumps to 3001 if taken, which changes your URL out from under you. The smoke script pins the port (`PORT=` → `-p`) so curls hit the intended server.
- **asdf noise** — `No version is set for nodejs` prints on every npm command in this environment. Harmless; does not affect dev/test/build.

## Troubleshooting

| Symptom                                | Fix                                                              |
| -------------------------------------- | ---------------------------------------------------------------- |
| `/` returns 404, `/foo` returns 308    | basePath dropped — use `http://localhost:PORT/contributions/...` |
| curl hits the wrong app / `EADDRINUSE` | Port 3000 in use. Run with `PORT=3100 ...`                       |
| Smoke prints "SERVER DID NOT START"    | Check `/tmp/run-contributions-dev.log` — usually a compile error |
