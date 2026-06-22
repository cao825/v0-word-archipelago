# Word Archipelago

Turn-based word-puzzle game (package name `word-isles`): form words by connecting
letter "islands". **Next.js 16 (App Router) + React 19 + Redux Toolkit + pnpm**,
deployed to Vercel. Leaderboard persists to **Upstash Redis** via API routes.
Part of the OleyArcade fleet — but a DOM/Redux web app, not a Three.js game (see
"Not applicable" below).

## Architecture

- `lib/services/` and `lib/slices/` — **pure TypeScript**, no React, no DOM
  (`window`/`document`/`localStorage`/hooks). Reducers and selectors are pure:
  same inputs → same outputs, no side effects. This is the load-bearing rule.
- `lib/hooks/` — React-bound state access (typed `useAppSelector`/`useAppDispatch`).
- `components/` — the React/DOM render layer; reads state, dispatches actions.
- `lib/utils/` — pure helpers (island/objective generation seed from the hour).
- `app/` — App Router pages + `app/api/leaderboard` (Upstash Redis). State lives
  in Redux, not the DOM.

## Hard rules (load-bearing invariants)

- **pnpm 10 ONLY.** `packageManager` pins `pnpm@10.34.4`; the lockfile is
  pnpm-lockfile v9 format and Vercel/CI resolve pnpm from it. Any lockfile work
  MUST run under `corepack use pnpm@10.34.4` — pnpm 11 rewrites the lockfile and
  breaks the deploy. Docs/code PRs touch no deps.
- **`pnpm.overrides` is LIVE** (pnpm 10 honors it — security floors for transitive
  deps). Raise floors; never delete entries.
- **The build ENFORCES types.** `next.config.mjs` has no `ignoreBuildErrors`, so a
  `tsc` error fails `next build` and the deploy. Keep `npx tsc --noEmit` at 0.
- **Lint is the ESLint CLI** (`pnpm lint` → `eslint`). `next lint` was removed in
  Next 16; config is `eslint.config.mjs` (flat).
- **Tests pin behavior** (`pnpm test`, jest via next/jest). Green is 90/90 and
  deterministic — keep it that way (no time/seed-coupled flakiness).
- **Canonical domain is `wordisles.com`** — not the `*.vercel.app` slug. Use it in
  metadata/canonical/OG.
- **Secrets are `process.env` only.** `KV_REST_API_URL` / `KV_REST_API_TOKEN` are
  live Upstash secrets — never commit them; GitHub push protection is on.

## Working method

- **Recon first**, then act: read the code/tests before changing them.
- **Diagnose before patching** — find the root cause; don't paper over a symptom
  (e.g. don't weaken a test to hide a real bug, or mock around a real defect).
- A change isn't done until tsc + test + lint are all green.

## Not applicable (fleet game-engine rules — N/A here, with reason)

This is a **turn-based Redux + DOM** word game: no `<canvas>`, no WebGL, no
`requestAnimationFrame` simulation loop. So the sibling game rules do NOT apply:

- **No `three.js` purity rule** — there is no rendering engine; the purity line is
  `lib/services`+`lib/slices` (pure) vs `components` (React/DOM).
- **No game loop / fixed-timestep / no per-frame allocation / bounded pools** —
  there is no `input → update → render` loop; gameplay advances on Redux actions.
- **No procedural geometry / synthesized-audio / zero-assets rules** — UI is
  DOM + CSS (Tailwind).
- **No twin-stick / joystick / touch-keyboard parity** — input is tap-to-select;
  the app is already mobile-responsive via CSS.

## Deployment

Vercel auto-deploys on merge to `main`. This is **not** a static site — it has API
routes (`app/api/leaderboard`) backed by Upstash Redis.

## PR workflow

Branch from latest `main` → PR → checks → **auto-merge on green**. `main` is
protected: required checks are `verify` (tsc+test+lint), `Analyze
(javascript-typescript)` (CodeQL), `scan-pr / osv-scan` (OSV), `Dependency review
(non-blocking)`, and `Vercel`; `enforce_admins` is false (admin escape hatch);
auto-merge is on and **claude-review** drives it (reviews, fixes-to-green, then
`gh pr merge --squash --auto`). Claude Code **never pushes to `main`** and never
bypasses branch protection — let the pipeline merge.
