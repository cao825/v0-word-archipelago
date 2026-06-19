# RECON — word-archipelago ground truth (v2, refreshed)

**This supersedes the PR #6 recon.** That version is now substantially stale (6 PRs merged since) and several of its claims were **falsified** — see Part B. Read this, not the old assertions.

**Scope:** Read-only re-recon. No source/workflow/config changed — this PR touches only `RECON.md` and `plan.md`.
**Date:** 2026-06-19 · **Branch:** `plan-refresh-v2` (from latest main) · **gh:** `cao825` · **main HEAD:** `e1fed2f` (next 16.2.6 bump, #12)
**Package name:** `word-isles` · **Repo:** `cao825/v0-word-archipelago`

Findings tagged **OBSERVED** (command run, output seen) vs **INFERRED** (reasoned). Caveats carry equal weight — collected at the end.

---

## PART A — Current state (re-verified, not carried from the old doc)

### A0. Load-bearing invariant (NEW — was absent from the old recon)
**The repo runs on pnpm 10, pinned.** `package.json` has `"packageManager": "pnpm@10.34.4"`; the committed `pnpm-lock.yaml` is a **pnpm-10 artifact** (`lockfileVersion '9.0'`). **Vercel and CI resolve pnpm from this field.** Any work that regenerates the lockfile **MUST** run under pnpm 10.34.4 (`corepack use pnpm@10.34.4` first). A local pnpm 11 rewrites the lockfile as a pnpm-11 artifact → Vercel detects the lockfile-author/declared-version mismatch and **fails the deploy** (this exact failure happened and was fixed during the #7→#12 sequence). This invariant governs every future PR that touches deps.

### A1. Merged-PR state — OBSERVED (`gh pr list --state merged`)
The fleet-port sequence (all merged, in order):
| PR | What landed |
|---|---|
| **#7** | Advisory `claude-review.yml` (Next.js + pnpm + jest, SHA-pinned, **no** auto-merge) |
| **#8** | Jest harness repair — `ts-jest` preset → **`next/jest`**; `onlyBuiltDependencies` allowlist (sharp, unrs-resolver) |
| **#9** | Type fixes — **tsc 27 → 4**; deleted 5 dead v0 components; `dictionaryService` runtime bug; GameTheme reconciled |
| **#10** | Review-auth fix — `github_token: ${{ github.token }}` (action no longer needs the Claude GitHub App) |
| **#11** | Added a real `.gitignore` (repo had none) |
| **#12** | **next 16.0.10 → 16.2.6** (cleared all next advisories) |
(Plus #6 = the original recon docs this PR replaces; #1–#5 = earlier v0/Dependabot work.)
**Vercel on main HEAD: `success`** (OBSERVED). Auto-deploy dashboard state itself remains **unverifiable from the repo** (flagged).

### A2. TypeScript — OBSERVED (`npx tsc --noEmit`)
**Exactly 4 errors** — the React-19-experimental quarantine, unchanged by the next bump:
```
components/game-board.tsx(4,55)       Module '"react"' has no exported member 'useEffectEvent'
components/game-board.tsx(21,10)      Module '"react"' has no exported member 'Activity'
lib/hooks/use-game-timer.ts(3,29)     useEffectEvent
lib/hooks/use-puzzle-checker.ts(3,29) useEffectEvent
```
Still masked by `next.config.mjs` `typescript.ignoreBuildErrors: true` (untouched — its removal is gated on tsc reaching 0). **INFERRED:** these are React-package type errors (the installed `@types/react`/`react` don't export these unstable APIs as used), independent of next — confirmed by the #12 bump leaving the count at 4.

### A3. Tests — OBSERVED (pnpm 10.34.4, `pnpm test`, run 4×)
**80 passed / 10 failed / 90 total** (9 suites: 4 pass, 5 fail). Within a single hour the failing set is **stable at 10**. Across runs in the prior task it flipped 79↔80 — the flipper is **`Leaderboard Utils › getHourlyLeaderboard › …current hour`** (wall-clock dependent).

**Flaky (time/seed-coupled) vs deterministic split** (matters for the test-fixes PR):
- **Time/seed-coupled** (OBSERVED `Date.now()`/`Math.random()`/`seedRandom(hourlyTimestamp)` in `lib/slices/gameSlice.ts` + `lib/utils/islandGenerator.ts`): `getHourlyLeaderboard` (current hour), `Island Generator › Q islands have a U neighbor` (hourly-seeded generation), the `Game Slice › submitWord` combo-timing trio (`Date.now()`). These need deterministic seeding / fake timers, not assertion fixes.
- **Deterministic assertion failures** (stable every run): `Leaderboard Utils` (addLeaderboardEntry, formatTimestamp, getLeaderboardEntries), `Objective System` (checkObjectives, generateObjectives 'his'), `Word Utils › findPossibleWords`. These are real logic/assertion mismatches.
- **Caveat:** the flaky/deterministic split is INFERRED from source coupling + the observed 79↔80 flip; I did not isolate each test with fake timers. Treat the boundary as a starting hypothesis for the test-fixes PR.

### A4. Security backlog — OBSERVED (`gh api … dependabot/alerts`)
**26 open** (down from 64 pre-#12). Severity: **1 critical, 12 high, 9 medium, 4 low**.
- **0 `next` alerts remain** — #12 cleared all 44 next alerts (22 advisories × 2 manifests). OBSERVED.
- **All 26 remaining are transitive** (every one in `pnpm-lock.yaml`; **none in `package.json`** — no direct-dep advisories left). Clustered:

| pkg | sev | | pkg | sev |
|---|---|---|---|---|
| **shell-quote** | **critical** | | ws | 4 (3 high, 1 med) |
| minimatch | 3 high | | picomatch | 4 (2 high, 2 med) |
| flatted | 2 high | | js-yaml | 2 med |
| glob | high | | form-data | high |
| brace-expansion | 2 (med, low) | | yaml / postcss / ajv | med |
| @tootallnate/once, @eslint/plugin-kit, @babel/core | low | | | |

- **Code scanning: not enabled. Secret scanning: not enabled.** (Both OBSERVED via API.)
- These are dev/build-chain transitives — clearable via lockfile refresh + Dependabot transitive PRs + raising the (live) overrides floor (see B1). Not a direct-dependency problem.

---

## PART B — Falsified claims from the old recon (corrected with evidence)

### B1. "pnpm.overrides is DEAD / ignored" → **FALSE. It is LIVE.** (OBSERVED)
The old doc called the `package.json` `pnpm.overrides` block dead because pnpm **11** prints `The "pnpm" field in package.json is no longer read`. But the repo runs **pnpm 10.34.4**, which **does** honor it. Evidence: the committed `pnpm-lock.yaml` contains a top-level block —
```
overrides:
  minimatch: '>=3.1.3'
  lodash: '>=4.18.0'
```
— which only exists because pnpm 10 read the field and wrote it into the lockfile. `minimatch` resolves to a single deduped `9.0.5`. The deprecation warning was a **pnpm-11-LOCAL artifact**, not the repo's runtime.
**Nuance:** the override is *honored* but its floor `>=3.1.3` is **too permissive** to clear the current minimatch advisory (3 high alerts persist — the patched version is above what `>=3.1.3` forces). So "live but the pin needs raising," not "dead."

### B2. "harness blocked by ts-jest AND ERR_PNPM_IGNORED_BUILDS" → **half FALSE.** (OBSERVED in #8)
The `ERR_PNPM_IGNORED_BUILDS` hard-fail was a **pnpm-11-only** behavior. Under the repo's pnpm 10.34.4, ignored build scripts (sharp, unrs-resolver) are a **warning**, not a blocker — `pnpm install`/`pnpm test` do not hard-fail on them. The **sole** real blocker was the missing `ts-jest` preset, fixed by switching `jest.config.js` to **`next/jest`** (#8). The `onlyBuiltDependencies` allowlist (#8) is good hygiene (and protects pnpm-11 environments) but was not the actual unblock.

### B3. "next ≥ 16.1.7 clears all next advisories" → **FALSE.** (OBSERVED via #12)
16.1.7 cleared only **8** of the 22. The verified floor was **16.2.6**, now merged (#12). Post-merge: **0 open next alerts** (A4). The old doc's INFERRED "≥16.1.7 clears the bulk" was wrong on the floor.

### B4. Lockfile/pnpm invariant — **was entirely absent from the old doc.** Now documented at A0 and at the top of `plan.md` as a hard, load-bearing invariant for all future dep work.

---

## PART C — Fleet productionization + CI/CD + process inventory (NEW)

Siblings read on disk: `/Users/craigoleyagent/Developer/{neon-drift,rogue-descent,wild-trails}`. neon-drift & rogue-descent carry the **full 9-workflow set**; wild-trails a 7-subset. **Key framing:** siblings are **Vite + Three.js** static games; word-archipelago is **Next.js 16 + React 19 + Redux**, so most productionization items have a **different idiomatic mechanism** (Next Metadata/route conventions, not hand-edited `index.html`), and much of it **already ships** in the v0 scaffold.

### C1. CI/CD + security workflows
| Item | Sibling | word-archipelago | Disposition |
|---|---|---|---|
| `claude-review.yml` | ✅ | **PRESENT** (#7 advisory; #10 auth) | done |
| `dependabot.yml` | ✅ | **PRESENT** (`.github/dependabot.yml`) | done — don't re-add |
| `ci.yml` (lint/typecheck/test gate) | ✅ | **ABSENT** | **ADAPT** — retarget to `pnpm`/`jest`/`tsc`; red until tsc=0 + tests green |
| `codeql.yml` | ✅ | **ABSENT** | portable ~as-is (JS/TS) |
| `osv-scanner.yml` | ✅ | **ABSENT** | portable as-is |
| `dependency-review.yml` | ✅ | **ABSENT** | portable as-is |
| `semgrep.yml` | ✅ (not wild-trails) | **ABSENT** | **ADAPT** — repoint purity rule (C4) |
| `lighthouse.yml` | ✅ (neon/rogue) | **ABSENT** | **ADAPT** — *more* applicable here (real web app) than to the Three games |
| `e2e.yml` / `validation.yml` | ✅ | **ABSENT** | **N-A as-written** — no Playwright installed; needs a fresh pw setup (defer) |

### C2. PR process
- **`pr-pipeline.sh`** (`/Users/craigoleyagent/Scripts/pr-pipeline.sh`, launchd every 60s on the Mac mini): PR-watcher that iMessages on merge / claude-held / orphan-branch(>20min) / failed-auto-rebase, and retriggers claude-review where present. **REPOS = `ClawApp, cologne-service, askthebot, neon-drift, rogue-descent, wild-trails`** — **word-archipelago is NOT in it** (and the array is `craigoley/`-owned; this repo is `cao825/`). This repo currently gets **none** of that automation. (OBSERVED. Enrolling means editing a Scripts file *outside this repo* — flagged.)
- **Branch protection / required checks: UNVERIFIABLE** — API returns 403 ("Upgrade to GitHub Pro or make this repository public"). Branch protection is unavailable on this private repo, so the advisory checks are non-gating **by infrastructure**, not just by design. (OBSERVED 403.)
- **Draft-gating / auto-merge:** claude-review is **advisory only** — auto-merge deliberately omitted in #7 (TODO(PR6) markers). All merges so far were manual.

### C3. Productionization (Next.js mechanism — much already present)
| Item | Fleet (Vite) | word-archipelago (Next) | Disposition |
|---|---|---|---|
| Title / description / keywords | `<head>` | **PRESENT** — `metadata` export in `app/layout.tsx` | done |
| OG + Twitter tags | hand `<meta>` | **PRESENT** — `metadata.openGraph` + `metadata.twitter` (summary_large_image) | done |
| OG share image | Playwright PNG | **PRESENT** — static `public/og-image.png` (1200×630) **and** dynamic `app/api/og/route.tsx` (next/og `ImageResponse`). Playwright N-A. | done |
| `metadataBase` | n/a | **ABSENT** — build warns "metadataBase not set"; relative OG URLs resolve to `localhost` | **ADAPT** — set `metadataBase` |
| `viewport` / `theme-color` | `<meta>` | **ABSENT** — no Next `viewport` export | **ADAPT** — add `app` viewport export |
| favicon | static file | **PARTIAL / UNWIRED** — icon files exist in `public/` (`icon.svg`, `apple-icon.png`, light/dark 32px) but are **not wired** (no `app/icon.*` route, no `metadata.icons`, no `public/favicon.ico`) → browser default likely served | **ADAPT** — wire via `app/` icon convention or `metadata.icons` |
| PWA manifest + Apple home-screen | manifest.json + `<link>` | **ABSENT** — no `app/manifest.ts`, no `metadata.manifest` | **ADAPT** — add typed `app/manifest.ts` |
| robots / sitemap | n/a | **PRESENT** as **static** `app/robots.txt` + `app/sitemap.xml` | optional **ADAPT** — upgrade to typed `app/robots.ts`/`sitemap.ts` (low priority; static works) |
| Lighthouse CI gate | ✅ | **ABSENT** | **ADAPT** (C1) |

### C4. Architectural-invariant gate
The fleet's Semgrep gate enforces "no `three`/DOM/`Math.random` under `src/game/`." **This repo has no `src/game/`** — the analogue is **"no React/DOM imports in `lib/services` & `lib/slices` (reducers/selectors pure)."** **Spot-check (OBSERVED):** `grep` for `react`/`react-dom`/`document.`/`window.`/`localStorage` across `lib/services` + `lib/slices` → **clean**; the boundary is currently respected. **Caveat:** spot-check, not an exhaustive audit. (Note: `Math.random` in `lib/utils/islandGenerator.ts` is the source of test flakiness but is *outside* this purity rule's scope — it's a determinism issue for the test-fixes PR.) **ADAPT** — encode as a semgrep/eslint rule so it stays clean.

### C5. Validation sweep
The fleet's game-validation template targets render/physics determinism — **largely N-A** for a turn-based word game. The meaningful analogue is the **existing jest suite** (once de-flaked, A3). No separate validation harness warranted.

---

## Caveats roll-up (equal weight to the conclusions)
1. **Vercel auto-deploy dashboard state** — unverifiable from the repo (only commit-status `success` is observable).
2. **Branch-protection state** — unverifiable (403: private repo without Pro). Advisory checks are non-gating by infra.
3. **Flaky/deterministic test split (A3)** — INFERRED from source coupling + the 79↔80 flip; not each isolated with fake timers.
4. **minimatch override (B1)** — live and honored, but the `>=3.1.3` floor is too low to clear the current advisory; "raise the pin," not "revive a dead block."
5. **Purity spot-check (C4)** — `lib/services`+`lib/slices` clean on a grep spot-check, not an exhaustive audit.
6. **`pr-pipeline.sh` enrollment** — adding this repo is **out-of-repo** work (a Scripts file, `craigoley/`-owned array vs this `cao825/` repo); flagged, not actioned here.
7. **React-experimental tsc errors (A2)** — INFERRED to be wrong-import/version artifacts; whether the fix is a code change or a types bump is for the dedicated PR to determine.
8. This recon ran `pnpm install`/`pnpm test`/`tsc` under pnpm 10.34.4; any lockfile/`packageManager`-hash changes were reverted — **this PR is docs-only**.
