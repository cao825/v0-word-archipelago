# RECON — word-archipelago ground truth (v4)

**Supersedes v3 (PR #19).** 24 PRs merged since (#20–#43); the hardening pass is
complete. This is a current, factual snapshot of the architecture, the toolchain,
and the workflow/auto-merge stack. Stale pre-#19 claims removed.

**Date:** 2026-06-22 · **gh:** `cao825` · **main HEAD:** `8d12c21d` (#43)
**Package:** `word-isles` · **Canonical domain:** `https://wordisles.com`

OBSERVED (ran it / read disk) unless marked INFERRED.

---

## A. Stack + architecture

**Stack:** Next.js **16.2.9** (App Router) · React **19.2.7** · Redux Toolkit ·
TypeScript (strict, build-enforced) · **pnpm 10.34.4** · Tailwind **v4** · Jest via
`next/jest`. Deployed to **Vercel**. Leaderboard persists to **Upstash Redis**.

**Layered architecture (the load-bearing split):**
- `lib/services/` + `lib/slices/` — **pure TypeScript**, no React, no DOM. Reducers
  and selectors are pure (same inputs → same outputs). Spot-check: **clean**
  (OBSERVED — no `react` / `window` / `document` / `localStorage` imports).
- `lib/hooks/` — React-bound state access (typed `useAppSelector` / `useAppDispatch`).
- `lib/utils/` — pure helpers; island/objective generation is **seeded from the
  current hour** (`seedRandom`), so a board is deterministic within an hour.
- `lib/constants.ts` — 16 named/typed/grouped tuning constants (#43).
- `components/` — the React/DOM render layer (Tailwind v4 + CSS).
- `app/` — App Router pages + API routes:
  - `app/api/leaderboard` — Upstash Redis read/write (`KV_REST_API_URL` /
    `KV_REST_API_TOKEN`, `process.env` only).
  - `app/api/og` — dynamic `next/og` share image.

This is a **turn-based Redux + DOM** game: no `<canvas>`, no WebGL, no
`requestAnimationFrame` loop. The sibling Three.js/game-loop rules are **N-A** (see
[`CLAUDE.md`](./CLAUDE.md)), not missing gaps.

---

## B. Toolchain state (OBSERVED, pnpm 10.34.4)

- **TypeScript:** `tsc --noEmit` = **0**. `next build` runs the type pass
  (`ignoreBuildErrors` removed in #18) → a type regression fails the build + Vercel.
- **Tests:** `pnpm test` = **90/90, deterministic** across runs (#36 de-flaked the
  time/seed coupling). jest via `next/jest` (SWC transform).
- **Lint:** `pnpm lint` → `eslint` (flat `eslint.config.mjs`; `next lint` removed in
  Next 16). **0 errors / 0 warnings** (#22 set up, #34 triaged the 26 findings to 0).
- **Build:** `next build` succeeds; Vercel green on main HEAD.
- **Security:** ~64 → ~1 Dependabot alerts. Critical `shell-quote` cleared (#16);
  real CVEs cleared via exact `pnpm.overrides` (**15 entries**, LIVE) + the dependency
  batch (#24–#33); the last alert (js-yaml@3.14.2, ≤ 4.1.1 vulnerable) cleared by
  forcing 4.2.0 (#51) → **0 open alerts**. Code scanning (CodeQL) + secret scanning +
  push protection: **ON** (repo public).

---

## C. Workflow / CI / auto-merge stack

`.github/workflows/`: `ci.yml`, `claude-review.yml`, `codeql.yml`,
`dependency-review.yml`, `osv-scanner.yml`, `semgrep.yml`.

- **`ci.yml`** — the **`verify`** job (tsc + test + lint) on `pull_request` +
  push-to-`main`; SHA-pinned actions; `permissions: contents: read` (#37).
- **`codeql.yml`** — `Analyze (javascript-typescript)` on PR + push + schedule. Caught
  a **real** log-injection in `app/api/leaderboard/route.ts`, fixed in #21 (CWE-117).
- **`osv-scanner.yml`** — `scan-pr` (PRs, skips dependabot) / `scan-full` (push) —
  **advisory**.
- **`dependency-review.yml`** — `Dependency review (non-blocking)` on PRs —
  **advisory** (`continue-on-error`).
- **`semgrep.yml`** — the **`Semgrep arch-invariants`** gate (#52): a local-rules
  architectural check (NOT a SAST scanner — no SARIF). Gating ERROR rules enforce the
  pure-logic-layer split (no React / render-import / DOM-or-storage in
  `lib/services`+`lib/slices`) via `semgrep==1.167.0 --error`; a `continue-on-error`
  advisory step surfaces the WARNING determinism rule. PR + push-to-`main`, no
  dependabot `if:` / no paths filter. **REQUIRED** as of PR-B.
- **`claude-review.yml`** — the auto-merge driver. Pins `claude-code-action@d5726de0`
  (the siblings' last-known-good commit, #47 — see below); trust gate
  (`head.repo.full_name == github.repository`; OWNER/MEMBER for `@claude` comments);
  TOCTOU-guarded untrusted checkout (`ref: <pr-sha>`); `paths-ignore` skips its own
  edits. Uses the **OIDC Claude App token** (no `github_token`, #42) → trusted mode.
  Has a Fix + Merge prompt, an **is_error fail-safe**, and **failure telemetry** (dump
  + `claude-execution-output` artifact, #40/#42). A reviewer fix-PUSH is validated by
  the required `verify` CI job (its own install), not by local pnpm — the Fix Phase
  prompt states this CI-gate model (#50).

**Untrusted-restore (precise):** the action's `Restoring … from main (PR head is
untrusted)` precaution restores only `.claude*`, `.claude.json`, `.mcp.json`,
`CLAUDE.md`, `CLAUDE.local.md`, `.gitmodules`, `.ripgreprc`, `.husky`. **`.github/**`
is NOT in that list** — workflow/CI PRs auto-merge normally (confirmed #52). The only
special-cased workflow file is `claude-review.yml`, which `paths-ignore` SKIPS (a
separate mechanism from the restore).

**Branch protection on `main`** (REST, #38; corrected #40; Semgrep added PR-B):
required status checks = `["verify", "Analyze (javascript-typescript)", "Vercel",
"Semgrep arch-invariants"]` (the 4 that report on **every** PR incl. dependabot);
`strict: true`; `enforce_admins: false` (admin escape hatch); no required reviews.
`review-and-merge` is **not** required (a flaky-action day = merge-by-hand, not
lockout). Auto-merge is enabled on the repo.

**Auto-merge status: CONFIRMED WORKING (#47 / #48).** The thrash was a stale
`claude-code-action` SHA (`@2fee1551`, Claude Code 2.1.185) carrying a `claude_args`
whitespace-split regression that shredded the space-containing `--allowedTools` Bash
patterns. #47 pinned the siblings' last-known-good `@d5726de0` (2.1.177, 8 commits
earlier); #48 (lib/-only) then auto-merged hands-off — `permission_denials_count=0`,
allowlist intact, 14 turns, `mergedBy=app/claude`. **Watch-point:** this is a
DOWNGRADE — a forward-bump must re-verify `denials=0` first (full analysis + the
ruled-out list in [`plan.md`](./plan.md) → "AUTO-MERGE SAGA").

---

## D. Caveats (equal weight)
1. **Auto-merge is RESOLVED + CONFIRMED (#47/#48)** — root cause was the stale action
   SHA (not the earlier YAML/#844 claim, which was falsified). The one live caveat is
   the forward-bump watch-point: never blind-bump the action; re-verify `denials=0`.
2. **Purity is now ENFORCED** by the required `Semgrep arch-invariants` check (#52) —
   a violation (React/DOM/storage/render-import in `lib/services`+`lib/slices`) blocks
   merge, not just a hand-grep. The former `Math.random` determinism leak in
   `lib/utils/islandGenerator.ts` (`assignMultipliers`) is now hour-seeded (#48);
   re-introducing it triggers the advisory (non-gating) Semgrep WARNING.
3. **The `js-yaml@3` alert** root-causes (INFERRED via `pnpm why`) to an unused
   `react-spring` → metro native chain — trimming it is a runtime-dep decision.
4. **`pr-pipeline.sh` enrollment** is out-of-repo (a `craigoley`-owned Scripts file);
   flagged, not actioned.
5. This recon ran tsc/test/lint/build under pnpm 10.34.4; this PR is **docs-only**
   (`plan.md` + `RECON.md`), no source/workflow/config/lockfile touched.
