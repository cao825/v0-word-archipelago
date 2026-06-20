# plan.md — remaining roadmap (v3, refreshed)

**Supersedes the v2 plan (PR #13).** Re-derived from `RECON.md` (v3). **Track 1 (type-safety) is COMPLETE** (#17 tsc→0, #18 build enforces types). This records all merged work and sequences the tail.

## Naming convention
- **GitHub `#N`** = a real merged/open PR. **`plan: <slug>`** = pending work, no PR yet.

---

## ⚠️ LOAD-BEARING INVARIANTS — read before any PR
1. **pnpm 10 only.** `packageManager` pins `pnpm@10.34.4`; the lockfile is a pnpm-10 artifact (`lockfileVersion '9.0'`); Vercel/CI resolve pnpm from it. Any lockfile-touching PR: `corepack use pnpm@10.34.4` first, verify `pnpm --version`, revert any sha512 appended to `packageManager`. A pnpm-11 install breaks the Vercel deploy.
2. **`pnpm.overrides` is LIVE** (17 entries). Use **exact** pins or scoped `pkg@major` (a range like `>=x` forces the *latest* major — dangerous). Don't delete the block.
3. **No branch protection** (private, no Pro). Every check is non-gating; merges are manual until `plan: enforce-review`.
4. **Canonical domain = `wordisles.com`** (set in #15). Don't reintroduce `*.vercel.app` as canonical.
5. **Build now enforces types** (#18). A type regression fails `next build` + the Vercel deploy — keep `tsc --noEmit` at 0.

---

## DONE (merged — complete record)
| PR | Outcome |
|---|---|
| #7 | Advisory `claude-review.yml` (SHA-pinned; no auto-merge) |
| #8 | Jest harness `ts-jest`→`next/jest`; `onlyBuiltDependencies` allowlist |
| #9 | tsc 27→4; deleted 5 dead components; `dictionaryService` bug; GameTheme single-source |
| #10 | claude-review auth via `github_token` (no GitHub App needed) |
| #11 | Added `.gitignore` |
| #12 | next 16.0.10 → 16.2.6 (cleared all next advisories) |
| #13 | Docs refresh v2 |
| #14 | Productionization: metadataBase, viewport/themeColor, favicon, PWA manifest |
| #15 | Canonical domain → `wordisles.com` |
| #16 | Security 26→5 transitive (critical `shell-quote` cleared) via exact overrides |
| #17 | react 19.0→**19.2.7**, @types 19.2.x → **tsc 4→0** |
| #18 | Removed `ignoreBuildErrors` → **build enforces types** |

**Current baseline:** tsc **0** (build-enforced), tests **80/90**, **5** transitive Dependabot alerts (0 critical), Vercel green, lint **broken**.

---

## PENDING — sequenced

### Track 2 — security tail
**`plan: security-newdrift`** · auto-review eligible · no deps
The 5 open alerts are **not stuck** (RECON A4 corrects this):
- **js-yaml** — already at 4.2.0 (patched); the alert is **stale**, should auto-close on Dependabot re-scan. Verify, no action likely needed.
- **picomatch@4** (high+med) → add scoped override `"picomatch@4": "4.0.4"` (same-major patch).
- **ws@7** (high) → add scoped override `"ws@7": "7.5.11"` (same-major patch).
Two scoped overrides under pnpm 10.34.4 clear the real ones. (Deeper: `react-spring` drags in `react-native`/metro — the recurring alert source; trimming that is a separate runtime-dep decision, not required here.)

**`plan: code-scanning`** · auto-review eligible · no deps
Add `codeql.yml` + `osv-scanner.yml` + `dependency-review.yml` (port ~as-is). Enable **secret scanning** in repo settings (settings change — may be outside a PR). Both code- + secret-scanning are off (RECON A4).

### Track 3 — lint + CI gating (ordered)
**`plan: eslint-setup`** · auto-review eligible · no deps · **prereq for any lint-gating**
Lint is **broken** (RECON A5: Next 16 removed `next lint`; no flat config). Add a flat `eslint.config.mjs` (on `eslint-config-next` flat) + a working `lint` script (`eslint .`). Decide on `@eslint/plugin-kit`/eslint version alignment (the #16 override forced plugin-kit 0.3.4; a real eslint setup may need eslint ≥9.18).

**`plan: ci-workflow`** · auto-review eligible · **depends on** `eslint-setup` (for the lint step)
Add `ci.yml` (typecheck + test + lint), retargeted to pnpm/jest/tsc. Typecheck+test can land first (both green); add lint once `eslint-setup` lands. Report-only → required.

**`plan: enforce-review`** (the `TODO(PR6)` work) · **manual-merge** · **depends on** `ci-workflow` + stable tests
Re-enable claude-review auto-merge (restore Fix/Merge phase → `gh pr merge --squash --delete-branch`), drop the install step's `continue-on-error`, and **fail the step on `is_error: true`** (a green check currently doesn't prove a real review ran). Track 1 is green, but **stabilize the flaky tests first** (`plan: test-fixes`) so auto-merge doesn't trip on the 79↔80 flip.

**`plan: semgrep-purity`** · auto-review eligible · low priority
`semgrep.yml` enforcing the adapted invariant: no React/DOM imports in `lib/services` & `lib/slices` (RECON B3 — currently clean).

### Track 4 — process/docs parity
**`plan: claude-md`** · auto-review eligible · no deps
Add `CLAUDE.md` (all siblings have one). Adapt the fleet hard-rules for this stack: pure `lib/services`/`lib/slices`, strict TS (build-enforced), pnpm@10.34.4 invariant, canonical domain, branch→PR→manual-merge. **Mark the Three.js/game-loop rules N-A** (see RECON B3) so a future session doesn't force a game architecture onto a Redux word game.

**`plan: security-md`** · auto-review eligible · no deps
Add `SECURITY.md` (siblings have it; portable text).

### Track 5 — test quality (gates enforcement)
**`plan: test-fixes`** · auto-review eligible · depends on harness (#8, done)
- **De-flake** the time/seed-coupled tests (fake timers / deterministic seeds): `getHourlyLeaderboard`, `Island Generator Q-U`, `Game Slice submitWord` combo trio. This is what flips 79↔80.
- **Fix the deterministic assertion failures**: `Leaderboard Utils` (3), `Objective System` (2), `Word Utils findPossibleWords`.
Goal: stable green `pnpm test` — a prerequisite for trustworthy `plan: enforce-review`.

### Track 6 — productionization tail + optional
- **`plan: constants-extract`** (optional) — extract scattered tuning (`timeLeft: 120`, `comboTimeWindow: 15000`, `word.length * 10`, multiplier probs) into a `lib/constants.ts` (RECON B3 ADAPT gap).
- **`plan: prod-seo`** (optional) — typed `app/robots.ts` / `app/sitemap.ts` (static versions work today).
- **`plan: lighthouse-ci`** (optional, low priority) — `lighthouse.yml`.
- **`plan: nvmrc`** (trivial) — add `.nvmrc` (22) to match the `engines` pin and the fleet.

### Out-of-repo (flagged, not a PR here)
**`plan: pr-pipeline-enroll`** — add `cao825/v0-word-archipelago` to the REPOS array in `/Users/craigoleyagent/Scripts/pr-pipeline.sh` (RECON B2). Edits a file outside this repo; the array is `craigoley/`-owned, so confirm the owner prefix. Needs your action.

---

## Banked review nits (fold into a later touching PR — don't PR these alone)
- `lib/utils/theme-config.ts` — the `?? THEME_CONFIGS.tropical` fallback is unreachable dead code (the `Record<GameTheme,…>` is complete). Drop when next touching the file (fits `plan: constants-extract`).
- `lib/utils/islandGenerator.ts:52` — the `// Initialized to 0…` comment restates the code; drop it (fits `plan: test-fixes`, which touches islandGenerator).
- The exact-pin override maintenance surface (#16 review) — consider floor-with-upper-bound ranges (`>=x.y.z <nextMajor`) for single-major packages so Dependabot can auto-patch (fits `plan: security-newdrift`).

## Explicitly NOT proposed (present / N-A — do not create)
- ❌ `dependabot.yml`, `claude-review.yml`, productionization/metadata/canonical-domain — done. ❌ "Add strict TS" / "enforce build types" — done (#9/#17/#18). ❌ Three.js purity, procedural assets, synthesized audio, game-loop/pool/timestep, joystick parity, visual-PR draft-gate — **N-A for this stack** (RECON B3). ❌ "kill dead pnpm.overrides" — it's LIVE.

## Suggested order
`security-newdrift` + `test-fixes` (parallel, both unblock other things) → `eslint-setup` → `ci-workflow` → `enforce-review` (turn gates on, once tests stable). In parallel/anytime: `claude-md`, `security-md`, `code-scanning` (all no-dep, low-risk). `constants-extract` / `prod-seo` / `lighthouse-ci` / `nvmrc` / `semgrep-purity` are the low-priority tail.
