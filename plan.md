# plan.md — Sequenced PR roadmap (fleet parity for word-archipelago)

Derived strictly from `RECON.md`. **Nothing here is implemented yet.** This is the ordering proposal for review.

**Principles**
- One concern per PR. Smallest reviewable unit.
- **Don't add what's already present:** `dependabot.yml` exists — no PR for it. `tsconfig` strict already on (the work is *un-defeating* it, not adding it). Test files + jest already exist — repair, don't re-scaffold.
- **Critical ordering constraint (from RECON A5/A6):** `tsc` is red (~25 errors) and the test harness can't run. Any auto-review/CI that gates on `tsc`/`test` will fail on day one. So **repair before gating.** Turn on enforcement only after the thing it enforces is green.
- **Auto-review caveat:** the very first PR cannot be auto-reviewed by `claude-review.yml` because that workflow doesn't exist yet (and a workflow added *in* a PR doesn't act on its own PR). PR 1 = manual merge. From the PR that lands `claude-review.yml` onward, subsequent PRs can auto-review (subject to author-association gating). Each PR below is marked accordingly.

---

## Track 0 — Bootstrap the review/CI layer (unblocks everything)

### PR 1 — Add `claude-review.yml` (adapted) + pin SHAs · **manual merge**
- Port sibling `claude-review.yml`, but **retarget for this stack**: `npm test` → `pnpm test`, `tsc` stays, drop three.js language from the prompt, keep author-association gating + concurrency.
- **Keep the exact pinned SHAs** (RECON C10): `actions/checkout@de0fac2e…` (v6.0.2), `anthropics/claude-code-action@d5726de0…` (v1).
- ⚠️ Make the review **non-gating / advisory** at first (do NOT have it auto-merge on a red `tsc`/`test`, since both are currently red — see Track 1/2). Enable enforcement after Track 1+2 land.
- *Manual merge* (the reviewer can't review the PR that introduces it).

### PR 2 — Add `ci.yml` (lint/typecheck/test) **in report-only mode** · auto-review eligible
- `pnpm install` → `pnpm tsc --noEmit` + `pnpm test`, on PR + push.
- Land it **`continue-on-error: true`** (or as a non-required check) because RECON A5/A6 say both steps fail today. This makes the red state *visible* without blocking. Flip to required at the end of Track 1/2.
- Auto-reviewable once PR 1 is merged.

---

## Track 1 — Make the codebase actually green (prerequisite for gating)

### PR 3 — Repair the test harness · auto-review eligible
- Root cause (RECON A5): `jest.config.js` uses `preset: "ts-jest"` but `ts-jest` isn't a dep; `pnpm test` also dies on `ERR_PNPM_IGNORED_BUILDS`.
- Either add `ts-jest` **or** switch preset to `next/jest`/babel-jest; resolve the pnpm ignored-builds gate (`sharp`, `unrs-resolver`) e.g. via `pnpm-workspace.yaml` `allowBuilds` or `--no-verify-store` in the test script.
- Done = `pnpm test` runs the 9 existing suites and reports real pass/fail. (Expect some to fail initially — fix or quarantine as a follow-up noted in the PR.)

### PR 4 — Fix the missing dependencies / modules · auto-review eligible
- RECON A6: code imports `next-themes` and `@radix-ui/react-slot` (not in `package.json`) and `@/components/ui/card` + `@/components/ui/input` (files don't exist).
- Add the missing deps and generate the missing shadcn `ui/card` + `ui/input`, OR remove the dead imports if those components are unused. This is the bulk of the `tsc` error count.

### PR 5 — Fix remaining type errors + the real bug · auto-review eligible
- `lib/slices/gameSlice.ts:505` duplicate object key (**real bug**), the two divergent `GameTheme` types, `RefObject<T|null>` mismatches in `leaderboard-display.tsx`, `islandGenerator.ts:97` `undefined`, `useEffectEvent`/`Activity` experimental-React usages, test-file type errors.
- Goal: `npx tsc --noEmit` exits clean.

### PR 6 — Remove `typescript.ignoreBuildErrors` + flip CI to required · auto-review eligible
- Only after PR 3–5 are green. Delete `ignoreBuildErrors: true` from `next.config.mjs` (RECON A3/A6) so the build enforces types.
- Make `ci.yml` checks **required** and enable `claude-review.yml` enforcement/auto-merge. This is the moment strict TS actually means something.

---

## Track 2 — Security remediation (its own track, parallelizable with Track 1)

> 64 open Dependabot alerts, all patchable (RECON B). Not one undifferentiated pile — split by effort.

### PR 7 — Bump `next` 16.0.10 → ≥ 16.1.7 · **the 69% win** · auto-review eligible
- Clears the **44 `next` alerts** (1 effective direct bump). Verify the app builds/runs after bump (Next 16 minor).
- ⚠️ After merge, **re-scan Dependabot** to confirm all 22 next advisories closed (RECON caveat #2 — a few cite only 15.x patched versions).

### PR 8 — Clear the critical + transitive chain via lockfile refresh · auto-review eligible
- The **1 critical (`shell-quote` → 1.8.4)** + the ~20 transitive tooling alerts (`picomatch`, `minimatch`, `flatted`, `brace-expansion`, `ws`, `yaml`, `js-yaml`, `glob`, `ajv`, `@tootallnate/once`, `@eslint/plugin-kit`).
- Refresh `pnpm-lock.yaml` to pull patched transitives; let grouped Dependabot PRs cover the rest. Most are dev/build-chain.
- **Also fix the dead `pnpm.overrides`** (RECON A4/B): pnpm 11 ignores the `package.json` `pnpm` field — move overrides into `pnpm-workspace.yaml` (or `.pnpmfile`) so the intended `minimatch`/`lodash` pins actually apply, and drop the bogus `lodash` entry.

### PR 9 — Enable code scanning · auto-review eligible
- RECON B: code-scanning + secret-scanning are **not enabled**. Add `codeql.yml` (JS/TS, ports cleanly), `osv-scanner.yml`, `dependency-review.yml` (port as-is from siblings — generic), and optionally `semgrep.yml`.
- Verify GitHub repo settings enable secret scanning (settings change, may be outside the PR).

---

## Track 3 — Hygiene & fleet conventions (lowest risk, do anytime after PR 1)

### PR 10 — Add `.gitignore` · auto-review eligible
- RECON A4: `.gitignore` is empty. Add standard Next/Node ignores (`node_modules/`, `.next/`, `tsconfig.tsbuildinfo`, `.vercel`, env files).

### PR 11 — Add `SECURITY.md` · auto-review eligible
- Port sibling `SECURITY.md` text (stack-agnostic). Closes a parity gap, no code risk.

### PR 12 — Add `.github/copilot-instructions.md` (rewritten for this stack) · auto-review eligible
- **Do NOT copy** the three.js version. Author Next/React/Redux rules: "no React/DOM imports in `lib/services` & `lib/slices` (keep reducers/selectors pure)", flag implicit `any`, magic numbers, etc. — the word-game analogue of the fleet's pure/render rule (RECON A2/C).

### PR 13 — Add a Next-flavored ESLint flat config · auto-review eligible
- RECON A4: deps exist, no config file. Add `eslint.config.*` built on `eslint-config-next` (flat). Don't copy the siblings' Vite/typescript-eslint config verbatim. Wire `pnpm lint` into `ci.yml`.

### PR 14 (optional) — `lighthouse.yml` · auto-review eligible
- More applicable to this real web app than to the Three games. Optional, low priority.

---

## Explicitly NOT proposed (already present / N-A — do not create)
- ❌ `dependabot.yml` — **present** and at parity.
- ❌ "Add strict TS" — **already on**; the work (PR 6) is removing `ignoreBuildErrors`, not adding strict.
- ❌ Re-scaffolding tests — **9 suites exist**; PR 3 repairs the runner.
- ❌ `e2e.yml`/`validation.yml`/three.js-purity lint — **N/A for this stack** without bespoke rework; deferred, not ported blindly.
- ❌ `?debug` telemetry — fleet spec under-specified for this app (RECON caveat #7); needs a spec before any PR.

## Suggested execution order
`PR1 → PR2` (visibility) → in parallel: **Track 1** `PR3→PR4→PR5→PR6` and **Track 2** `PR7→PR8→PR9` → **Track 3** `PR10–PR13` anytime → flip gates to required at PR6. PR1 is the only mandatory manual merge; everything after is auto-review eligible once PR1 lands.
