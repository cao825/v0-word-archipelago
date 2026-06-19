# plan.md — remaining roadmap (v2, refreshed)

**Supersedes the PR #6 plan.** Re-derived from `RECON.md` (v2). 6 PRs have merged since the original; this records what's DONE and sequences what's left.

## Naming convention (the numbering collided — fixed here)
- **GitHub `#N`** = an actual merged/open GitHub PR (e.g. `#12`).
- **`plan: <slug>`** = a pending unit of work with no PR yet. Use slugs, not bare numbers — the old plan's "PR 1/PR 6" step numbers collided with the GitHub PR counter.
References to "PR 6" in workflow `TODO(PR6)` comments mean **`plan: enforce-review`** below.

---

## ⚠️ LOAD-BEARING INVARIANTS — read before any PR

1. **pnpm 10 only.** `packageManager` pins `pnpm@10.34.4`; the lockfile is a pnpm-10 artifact (`lockfileVersion '9.0'`); **Vercel + CI resolve pnpm from this field.** Any PR that touches `pnpm-lock.yaml` MUST run `corepack use pnpm@10.34.4` first and verify `pnpm --version` → 10.34.4. A pnpm-11 install rewrites the lockfile and **breaks the Vercel deploy** (observed + fixed earlier). Revert any `corepack`-appended sha512 hash on the `packageManager` field.
2. **`pnpm.overrides` is LIVE** (pnpm 10 honors it — see RECON B1). Don't "clean it up" as dead; to fix `minimatch`, **raise its floor**, don't delete it.
3. **Docs/config-only PRs stay docs/config-only.** `git add -A` will sweep `node_modules/` if you're not careful (now mitigated by the `.gitignore` from #11, but still: stage explicit paths).
4. **No branch protection** (private repo, no Pro — 403). Every check is non-gating; merges are manual until `plan: enforce-review`.

---

## DONE (merged — complete record)
| GitHub PR | Outcome |
|---|---|
| **#7** | Advisory `claude-review.yml` (SHA-pinned; **no** auto-merge) |
| **#8** | Jest harness: `ts-jest` → `next/jest`; `onlyBuiltDependencies` allowlist → `pnpm test` runs |
| **#9** | tsc **27 → 4**; deleted 5 dead components; `dictionaryService` bug; GameTheme single-source |
| **#10** | claude-review auth: `github_token` → review actually runs (no GitHub App needed) |
| **#11** | Added `.gitignore` (repo had none) |
| **#12** | **next 16.2.6** → **0 open next advisories** |

Current baseline: **tsc 4** (React-experimental quarantine), **tests 80/90**, **26 transitive Dependabot alerts** (1 critical), Vercel green.

---

## PENDING — sequenced

### Track 1 — make the baseline green (prerequisite for gating)

**`plan: type-fix-experimental`** · auto-review eligible · no deps
Resolve the 4 residual tsc errors (`useEffectEvent` ×3, `Activity` ×1 in `game-board.tsx`, `use-game-timer.ts`, `use-puzzle-checker.ts`). These are unstable React 19 APIs the installed `@types/react` doesn't export as used. Decide per error: correct the import, gate behind a feature/version, or bump `@types/react`/`react` (lockfile touch → **pnpm 10.34.4**). Goal: `tsc --noEmit` = 0.

**`plan: test-fixes`** · auto-review eligible · depends on harness (#8, done)
Two distinct sub-problems (RECON A3):
- **De-flake** the time/seed-coupled tests — inject deterministic seeds / fake timers for `getHourlyLeaderboard`, `Island Generator › Q-U`, and the `Game Slice › submitWord` combo trio (`Date.now()`). This is what makes the suite flip 79↔80.
- **Fix the deterministic assertion failures** — `Leaderboard Utils` (3), `Objective System` (2), `Word Utils › findPossibleWords`. Real logic/assertion mismatches.
Goal: a stable, green `pnpm test`. (Fold in the banked nits — see bottom.)

**`plan: remove-ignore-build-errors`** · auto-review eligible · **depends on** `type-fix-experimental` (+ ideally `test-fixes`)
Delete `typescript.ignoreBuildErrors: true` from `next.config.mjs` so `next build` enforces types. Only after tsc = 0, or the Vercel build goes red.

### Track 2 — security remediation (parallel; independent of Track 1)

**`plan: security-transitive`** · auto-review eligible · no deps
Clear the 26 transitive alerts (RECON A4) — **lockfile touch → pnpm 10.34.4**. The 1 **critical** is `shell-quote`. Refresh `pnpm-lock.yaml` to pull patched transitives; let grouped Dependabot PRs cover the rest. **Also raise the `minimatch` overrides floor** (RECON B1 — it's live but `>=3.1.3` is too low to clear the advisory); leave `pnpm.overrides` in place, just tighten the version.

**`plan: code-scanning`** · auto-review eligible · no deps
Add `codeql.yml` + `osv-scanner.yml` + `dependency-review.yml` (port ~as-is from siblings — generic JS/TS). Enable **secret scanning** in repo settings (a settings change, possibly outside a PR — flag). Both code- and secret-scanning are currently **off** (RECON A4).

### Track 3 — CI/CD gating + enforcement

**`plan: ci-workflow`** · auto-review eligible · **depends on** Track 1 green
Add `ci.yml` (lint/typecheck/test), retargeted to **pnpm + jest + tsc**. Land it report-only first (it'll be red until Track 1 lands), then make it required.

**`plan: enforce-review`** (the `TODO(PR6)` work) · **manual-merge** · **depends on** Track 1 green + `ci-workflow`
Re-enable claude-review's auto-merge (restore the Fix/Merge phase: iterate-to-green → `gh pr merge --squash --delete-branch`), drop the install step's `continue-on-error`, and **make the step fail on `is_error: true`** (RECON note — a green check currently doesn't guarantee a real review ran). Manual-merge (edits the workflow → paths-ignore skips its own review).

**`plan: semgrep-purity`** · auto-review eligible · low priority
Add `semgrep.yml` adapted to the repo's invariant: **no React/DOM imports in `lib/services` & `lib/slices`** (RECON C4 — currently clean). Encode so it stays clean.

### Track 4 — productionization (Next.js-idiomatic; much already ships — see RECON C3)
One small PR or a few; **only the gaps**, since metadata/OG/icons/robots/sitemap already exist.

**`plan: prod-metadata`** · auto-review eligible
- Set `metadataBase` (kills the build warning; fixes relative OG URLs resolving to localhost).
- Add a Next `viewport` export (`viewport` + `theme-color`).
- **Wire the favicon** — icons exist in `public/` but aren't connected; use the `app/` icon convention or `metadata.icons`.

**`plan: prod-manifest`** · auto-review eligible
Add a typed `app/manifest.ts` (PWA manifest + Apple home-screen) — currently absent.

**`plan: prod-seo`** (optional, low priority) · auto-review eligible
Upgrade static `app/robots.txt` / `app/sitemap.xml` → typed `app/robots.ts` / `app/sitemap.ts`. Static works today; this is polish + a crawlable game description.

**`plan: lighthouse-ci`** · auto-review eligible · low priority
Add `lighthouse.yml` (more applicable here than to the Three games). Defer behind the gating tracks.

### Out-of-repo (flagged, not a PR here)
**`plan: pr-pipeline-enroll`** — add `cao825/v0-word-archipelago` to the `REPOS` array in `/Users/craigoleyagent/Scripts/pr-pipeline.sh` (RECON C2). This repo currently gets no merge/orphan/rebase automation. **Edits a file outside this repo** (and the array is `craigoley/`-owned, so confirm the owner prefix) — needs your action, not a PR against this repo.

---

## Banked review nits (fold into a later touching PR — don't make a PR just for these)
- `lib/utils/theme-config.ts` — the `?? THEME_CONFIGS.tropical` fallback is now **unreachable dead code** (the `Record<GameTheme, …>` is complete after #9). Drop it when next touching the file (natural fit: `plan: prod-metadata` or `test-fixes`).
- `lib/utils/islandGenerator.ts:52` — the `// Initialized to 0…` comment restates the code; drop it (natural fit: `plan: test-fixes`, which touches islandGenerator for de-flaking).

## Explicitly NOT proposed (already present / N-A — do not create)
- ❌ `dependabot.yml`, `claude-review.yml` — present. ❌ "Add strict TS" — already on (work is removing `ignoreBuildErrors`). ❌ Re-scaffold tests — harness works (#8). ❌ OG/Twitter/share-image, robots/sitemap (basic), icon *files* — already shipped by the v0 scaffold (RECON C3). ❌ `e2e`/`validation` workflows — N-A (no Playwright). ❌ "kill dead pnpm.overrides" — it's LIVE (B1).

## Suggested order
`type-fix-experimental` + `test-fixes` (Track 1, parallel) → `remove-ignore-build-errors`; in parallel **Track 2** (`security-transitive`, `code-scanning`); then `ci-workflow` → `enforce-review` (flip gates on); `semgrep-purity` + **Track 4** productionization anytime after Track 1. `prod-*` PRs are low-risk and can slot in early if desired.
