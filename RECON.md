# RECON — word-archipelago ground truth (v3, refreshed)

**Supersedes the v2 recon (PR #13).** 5 PRs merged since (#14–#18): **Track 1 (type-safety) is now COMPLETE** and the build enforces types. This adds the full fleet best-practice scorecard (Part B). Re-verified against disk/GitHub — do not carry v2 claims unchecked.

**Scope:** Read-only re-recon. No source/workflow/config changed — this PR touches only `RECON.md` and `plan.md`.
**Date:** 2026-06-19 · **Branch:** `plan-refresh-v3` (from latest main) · **gh:** `cao825` · **main HEAD:** `aa8d39e4` (#18)
**Package:** `word-isles` · **Canonical domain:** `https://wordisles.com` (set in #15)

OBSERVED (ran it, saw output) vs INFERRED (reasoned). Caveats carry equal weight — collected at the end.

---

## PART A — Current state (re-verified)

### A0. Load-bearing invariants (unchanged, still governing)
- **pnpm 10 only:** `packageManager` pins `pnpm@10.34.4`; lockfile is a pnpm-10 artifact (`lockfileVersion '9.0'`); Vercel/CI resolve pnpm from it. Lockfile work MUST run under `corepack use pnpm@10.34.4` or the deploy breaks.
- **`pnpm.overrides` is LIVE** under pnpm 10 (now 17 entries from #16). Raise floors / add scoped `pkg@major` pins; don't delete.
- **No branch protection** (private repo, no Pro — API 403). All checks are advisory/non-gating; merges are manual.
- **Canonical domain = `wordisles.com`** (the Vercel slug `v0-word-archipelago.vercel.app` is live too but secondary).

### A1. What landed since v2 — OBSERVED
| PR | Outcome |
|---|---|
| **#14** | Productionization: metadataBase, viewport/themeColor, favicon wiring, PWA `app/manifest.ts` |
| **#15** | Canonical domain → `wordisles.com` (metadataBase, openGraph.url, robots, sitemap, OG-image footer) |
| **#16** | Security: 26 → 5 transitive alerts via exact `pnpm.overrides` (critical `shell-quote` **cleared**) |
| **#17** | react/react-dom 19.0.0 → **19.2.7**, @types 19.2.x → **tsc 4 → 0** (the experimental APIs graduated to stable in 19.2; bump, not rewrite) |
| **#18** | Removed `typescript.ignoreBuildErrors` → **`next build` now enforces types** |
**Vercel on main HEAD: `success`** (OBSERVED). Dashboard auto-deploy state still unverifiable from repo (flagged).

### A2. TypeScript — OBSERVED: clean AND enforced
- **`tsc --noEmit` = 0.**
- **`pnpm build` runs the type pass** — output shows **`Running TypeScript … Finished TypeScript`** (was `Skipping validation of types` pre-#18). So a type regression now **fails the build** (and the Vercel deploy). Track 1 is done.
- Minor: build warns TypeScript 5.0.2 < recommended 5.1.0 (non-fatal; `typescript: "^5"`).

### A3. Tests — OBSERVED (pnpm 10.34.4)
**80 passed / 10 failed / 90** (5 suites fail). Within-hour stable at 10; flips 79↔80 across hours via the wall-clock-dependent `getHourlyLeaderboard`.
- **Flaky (time/seed-coupled):** `getHourlyLeaderboard`, `Island Generator Q-U` (hourly-seeded), `Game Slice submitWord` combo trio (`Date.now()`). Need deterministic seeding / fake timers.
- **Deterministic assertion bugs:** `Leaderboard Utils` (addLeaderboardEntry, formatTimestamp, getLeaderboardEntries), `Objective System` (checkObjectives, generateObjectives 'his'), `Word Utils findPossibleWords`.
- Caveat: split is INFERRED from source coupling + the 79↔80 flip, not isolated per-test with fake timers.

### A4. Security — OBSERVED: 26 → 5, **none genuinely "stuck"** (corrects the brief's premise)
**5 open** (3 high, 2 medium). All transitive, dev/build-chain, in `pnpm-lock.yaml`. **The critical `shell-quote` was cleared by #16.** code-scanning + secret-scanning: **still off.**

| pkg | sev | resolved now | patched | status — corrected |
|---|---|---|---|---|
| **js-yaml** | medium | **4.2.0** | 4.2.0 | **STALE alert** — already at the patched version (#16's `js-yaml@4` override). Should auto-close on Dependabot re-scan; not a real open vuln. |
| **picomatch** | high + medium | 4.0.3 | 4.0.4 | **NEW advisory** (published after #16; #16 only scoped `picomatch@2`). Fixable with a same-major scoped override `picomatch@4: 4.0.4`. |
| **ws** | high | 7.5.10 | 7.5.11 | **NEW advisory** (#16 scoped `ws@8`; the 7.x wasn't flagged then). Fixable with `ws@7: 7.5.11`. |

**Correction:** the brief assumed these 5 were "stuck — couldn't be forced without a major jump." **Not so.** js-yaml is already patched (stale); picomatch@4→4.0.4 and ws@7→7.5.11 are **same-major patch bumps**, safely forceable via scoped overrides — they're simply **newly-published advisories** that appeared after #16. None require a major jump or a runtime-dep bump.
**Root-cause note (INFERRED from `pnpm why`):** ws@6/7 and the picomatch@4 chain come through **`react-native@0.79.2` → metro**, pulled transitively by **`react-spring`** (a runtime dep) for its native/three modules — a large native toolchain this web app never uses. That chain is the recurring source of build-chain alerts; trimming it is a runtime-dep architectural question (out of scope), not required to clear these 5.

### A5. Lint — OBSERVED: BROKEN (real gap)
`pnpm exec next lint` → **`Invalid project directory provided, no such directory: …/lint`** — Next 16 **removed `next lint`** (it parses `lint` as a positional dir). **No eslint flat or legacy config exists.** So linting does not run anywhere (not in CI, not in build — Next 16 doesn't lint on build). Any future lint-gating depends on first adding a flat config + script (`plan: eslint-setup`).

### A6. Process/docs files — OBSERVED
**`CLAUDE.md` ABSENT. `SECURITY.md` ABSENT. `.github/copilot-instructions.md` ABSENT.** All three siblings have CLAUDE.md and SECURITY.md → real parity gaps.

---

## PART B — Full fleet best-practice scorecard

Extracted from the sibling **`CLAUDE.md`** files on disk (`neon-drift`, `rogue-descent`, `wild-trails`) + their workflow/process surface. Scored against word-archipelago. **Game-loop/Three.js practices are marked N-A with a reason** (this is a turn-based Redux+DOM word game, no canvas, no rAF loop) — they are NOT "missing gaps."

### B1. Process / discipline (universal)
| Practice | Status | Note |
|---|---|---|
| branch → PR → review → merge; never push main / never auto-`gh pr merge` | **PRESENT** | Followed across #7–#18; all merges manual (advisory review). |
| Recon-first (Step 0 reads disk, reports before coding) | **PRESENT** | This doc + every prior PR's recon phase. |
| Diagnose-before-patch; tests pin behavior | **PRESENT** | e.g. #17 diagnosed a version mismatch (not a rewrite); #16 traced why-chains before overriding. |
| `CLAUDE.md` (hard-rules doc) | **ABSENT** | All siblings have one → `plan: claude-md` (adapt for Next/Redux). |
| `SECURITY.md` | **ABSENT** | All siblings have one → `plan: security-md`. |
| `.github/copilot-instructions.md` | **ABSENT** | Optional (Copilot review hints). |
| `build must pass before PR` / Node pinned | **PARTIAL** | Build-gate effectively enforced via Vercel + #18; Node pinned via `engines: 22.x` but **no `.nvmrc`** (siblings have one). |

### B2. CI/CD + security workflows
| Workflow | Status | Disposition |
|---|---|---|
| `claude-review.yml` | **PRESENT** | Advisory (auto-merge intentionally off; `plan: enforce-review`). |
| `dependabot.yml` | **PRESENT** | Don't re-add. |
| `codeql.yml` | **ABSENT** | `plan: code-scanning` — portable ~as-is. |
| `osv-scanner.yml` | **ABSENT** | `plan: code-scanning`. |
| `dependency-review.yml` | **ABSENT** | `plan: code-scanning`. |
| `semgrep.yml` | **ABSENT** | `plan: semgrep-purity` — repoint rule (B3). |
| `lighthouse.yml` | **ABSENT** | Optional; more applicable here than to the Three games. |
| `ci.yml` (typecheck/test/lint gate) | **ABSENT** | `plan: ci-workflow` (lint step blocked on `plan: eslint-setup`). |
| `pr-pipeline.sh` enrollment | **ABSENT** | `cao825/v0-word-archipelago` not in the REPOS array (which is `craigoley/`-owned). Out-of-repo. |

### B3. Architecture (map to Redux/Next analogue, or N-A)
| Fleet practice | Status | Note |
|---|---|---|
| pure/render split (`src/game/` zero-three) | **ADAPT → PRESENT** | Analogue: no React/DOM in `lib/services` & `lib/slices`. **Spot-check: clean** (grep, OBSERVED). Enforce via `plan: semgrep-purity`. |
| no magic numbers; tuning in `constants.ts` | **ADAPT → ABSENT (gap)** | **No constants module.** Tuning is inline in `lib/slices/gameSlice.ts`: `timeLeft: 120` (×3), `comboTimeWindow: 15000`, `word.length * 10`, multiplier probs `0.2`/`0.05`. → optional `plan: constants-extract`. |
| `?debug=1` funnel/telemetry on pipelines | **ADAPT → ABSENT** | No `?debug` instrumentation found. App has real pipelines (dictionary→validation→scoring; leaderboard digest→display) that could use it, but low priority for a turn-based game. |
| strict TypeScript | **PRESENT** | `strict: true`, and now **build-enforced** (#18). |
| palette/theme centralized | **ADAPT → PARTIAL** | Theme colors centralized in `lib/utils/theme-config.ts` (`THEME_CONFIGS`); not a single palette constant but reasonable. |
| three.js zero-import rule | **N-A** | No `three`, no canvas — Redux/DOM rendering. |
| procedural / zero art assets | **N-A** | DOM/SVG UI; static icons/og-image are productionization, not game art. |
| synthesized Web Audio (no audio files) | **N-A** | Uses sound files in `public/sounds/`; fine for a non-game-loop app. |
| bounded pools / no per-frame allocation | **N-A** | No requestAnimationFrame game loop. |
| fixed-timestep loop; input via state not rAF | **N-A** | Turn-based; no simulation loop. |
| touch/keyboard joystick parity | **N-A** | Tap-based DOM UI (responsive), not a joystick game. |
| draft-gate for on-device-playtest visual PRs | **N-A** | No device-playtest flow (the `ready_for_review` trigger exists in claude-review but is unused). |

### B4. Productionization (mostly done — confirmed PRESENT)
| Item | Status |
|---|---|
| metadata / OG / Twitter / metadataBase / viewport / themeColor / icons / PWA manifest | **PRESENT** (#14) |
| canonical domain `wordisles.com` everywhere | **PRESENT** (#15) |
| robots / sitemap | **PRESENT** (static `app/robots.txt`, `app/sitemap.xml`) — optional `plan: prod-seo` typed `robots.ts`/`sitemap.ts` upgrade |
| OG share image (static + dynamic `next/og` route) | **PRESENT** |

---

## Caveats roll-up (equal weight to conclusions)
1. **Vercel dashboard / branch-protection** — unverifiable from repo (403 on branch-protection: private, no Pro). Checks are non-gating by infra.
2. **The 5 Dependabot alerts are NOT stuck** — js-yaml is stale (already 4.2.0); picomatch@4 / ws@7 are new same-major advisories, scoped-override-fixable. The brief's "couldn't be forced" premise was wrong; corrected in A4.
3. **Flaky/deterministic test split** — INFERRED from source coupling + the 79↔80 flip, not per-test fake-timer isolation.
4. **Purity spot-check** — grep over `lib/services`+`lib/slices`, not an exhaustive audit. `Math.random` in `lib/utils/islandGenerator.ts` is a determinism (test-flake) issue, outside the purity rule's scope.
5. **react-native/metro bloat** — INFERRED via `pnpm why` to come from `react-spring`'s native modules; trimming it is a runtime-dep decision, out of scope here.
6. **`pr-pipeline.sh` enrollment** is out-of-repo (a `craigoley/`-owned Scripts file vs this `cao825/` repo) — flagged, not actioned.
7. This recon ran tsc/build/test under pnpm 10.34.4; all lockfile/`packageManager`-hash drift reverted — **this PR is docs-only.**
