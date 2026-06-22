# plan.md — state + roadmap (v4)

**Supersedes v3 (PR #19).** 24 PRs merged since (#20–#43): the full hardening pass
landed — scanners, lint, deterministic tests, Tailwind v4, CI gate, branch
protection, CLAUDE.md, constants. This records the DONE state, the load-bearing
invariants, the auto-merge saga with its **confirmed** root cause + exact one-PR
finish, and the remaining tail.

This is the **state/roadmap** doc. [`CLAUDE.md`](./CLAUDE.md) is the **hard-rules**
doc — they agree; where CLAUDE.md says "auto-merge on green," that's the target
design, and the one gap below (`plan: auto-merge-format-fix`) is what makes it real.

## Naming convention
- **GitHub `#N`** = a real merged/open PR. **`plan: <slug>`** = pending work, no PR yet.

---

## STATE: DONE (verified this session)

- **Type-safety:** `tsc` 27→**0**; `next build` ENFORCES types (#9 / #17 / #18) — a
  type regression fails the build + Vercel deploy.
- **Security:** ~64 → ~1 alerts. Critical `shell-quote` cleared (#16); real CVEs
  cleared via exact `pnpm.overrides` (#16) + the dependency batch (#24–#33). CodeQL
  **caught a REAL log-injection** vuln in `app/api/leaderboard/route.ts` which we
  fixed (#20 added scanners, #21 sanitized input, CWE-117). Secret scanning + push
  protection **ON** (repo is public). 1 remaining alert = `js-yaml@3.14.2` old-major
  in the dep tree (`plan: security-jsyaml`).
- **Scanners live:** `codeql.yml`, `osv-scanner.yml`, `dependency-review.yml` (#20),
  reporting to the Security tab.
- **Productionization:** metadata / manifest / viewport / OG (#14); canonical domain
  `wordisles.com` (#15).
- **Lint: WORKS.** Next 16 removed `next lint`; `eslint.config.mjs` flat config + the
  ESLint CLI (#22). The 26 findings were triaged to **0/0** (#34) — real bugs fixed,
  intentional cases suppressed-with-reason, the rules kept armed.
- **Tests: STABLE 90/90** across 5 runs (#36) — de-flaked the time/seed coupling
  (fake timers / seeded RNG); fixed 1 real code bug (`formatTimestamp` `isNaN`
  guard); 8 test-wrong fixes (verified test-vs-code for each).
- **Tailwind v3→v4** migrated + visually verified on wordisles.com (#27, in batch).
- **CI gate:** `ci.yml` **`verify`** job (tsc + test + lint) on PR + push-to-main (#37).
- **Branch protection:** required = `["verify", "Analyze (javascript-typescript)",
  "Vercel"]` — the 3 that report on **every** PR including Dependabot (Analyze
  verified to run on dependabot via PR #33). `enforce_admins: false` (admin escape
  hatch); `strict: true`. OSV / dependency-review run **advisory** (not required —
  they skip dependabot / are non-blocking, so requiring them would lock dependabot PRs).
- **Constants:** `lib/constants.ts` — 16 named/typed/grouped constants; magic numbers
  extracted (#43).
- **CLAUDE.md** hard-rules doc added (#39); required-checks line corrected to the 3 (#40).
- **Telemetry:** claude-review failure-dump — `claude-execution-output` artifact +
  parsed denials, `if: always()` (#40 / #42) — makes a future thrash diagnosable in
  ONE run (it's what finally cracked the auto-merge root cause).

---

## ⚠️ LOAD-BEARING INVARIANTS — carry forward, every PR

1. **pnpm 10 ONLY.** `packageManager` pins `pnpm@10.34.4`; the lockfile is a pnpm-10
   artifact (`lockfileVersion '9.0'`); Vercel + CI resolve pnpm from it. Lockfile
   work MUST `corepack use pnpm@10.34.4` **first** (and revert any sha512 appended to
   `packageManager`) — a pnpm-11 install rewrites the lockfile and breaks Vercel.
2. **`pnpm.overrides` is LIVE** (pnpm 10 honors it). Raise floors / use exact or
   scoped `pkg@major` pins; don't delete the block.
3. **Canonical domain = `wordisles.com`** — not the `*.vercel.app` slug.
4. **Build ENFORCES types** — `tsc` 0 or `next build` + Vercel fail.
5. **`KV_REST_API_URL` / `KV_REST_API_TOKEN`** = live Upstash Redis secrets;
   `process.env` only; push protection is on.
6. **Lint = the ESLint CLI** (`pnpm lint` → `eslint`; `next lint` was removed in Next 16).
7. **Branch-protection contexts = the 3 all-PR checks** (verify / Analyze / Vercel);
   `enforce_admins: false` is the escape hatch. **Never require a check that skips
   dependabot** (e.g. OSV `scan-pr`) — it would lock dependabot PRs.
8. **Logic layer is pure:** `lib/services/` + `lib/slices/` — no React / no DOM; render
   in `components/`.
9. **Config-touching PRs force UNTRUSTED mode.** Files in the action's restore list —
   `.claude*`, `.mcp.json`, `CLAUDE.md`, `.github/**`, `.husky`, `.gitmodules`,
   `.ripgreprc` — make claude-review run untrusted. Keep workflow/config edits in
   their **own** PR (`paths-ignore` then skips claude-review) and never bundle them
   with source.

---

## AUTO-MERGE SAGA + CONFIRMED ROOT CAUSE (the critical handoff)

**State:** branch protection + the gates + the fail-safes (is_error gate) + the
telemetry all **WORK**. Hands-off auto-merge does **NOT yet work**. The root cause is
now **confirmed** (not inferred):

### THE BUG (source-confirmed via `anthropics/claude-code-action` issue #844)
`claude-review.yml` passes `claude_args` as a **multiline YAML block scalar**
(`claude_args: |`). In that form the action's parser splits `--allowedTools` on
**whitespace**, so every Bash pattern **containing a space** — `Bash(gh pr:*)`,
`Bash(gh api:*)`, `Bash(npx tsc:*)`, `Bash(pnpm test:*)`, `Bash(pnpm lint:*)` — is
shredded into garbage tokens (`"Bash(gh"`, `"pr:*)"`, …). Only space-free entries
survive (`Edit`, `Write`, `Read`, `Bash(git:*)`, `mcp__…`). The reviewer is then
**denied** `gh pr` / `gh api` / `tsc` / `pnpm test` / `pnpm lint` → thrashes to the
50-turn cap → never merges. The #43 telemetry showed the split array **directly**.

### WHY SIX PRIOR HYPOTHESES WERE WRONG (don't re-chase them)
1. **Missing Grep/Glob** — falsified: siblings lack them too and work fine.
2. **Missing `Bash(gh api:*)` (#40)** — falsified: it has a space, was shredded too;
   adding it never took effect.
3. **Config files force untrusted (#40)** — falsified: #43 was lib/-only and still thrashed.
4. **Untrusted token / OIDC (#42)** — REAL + necessary but **additive, not the whole
   cause.** Removing `github_token` + installing the Claude App got us to **trusted**
   mode (log: "OIDC token obtained → App token obtained", no "PR head is untrusted").
   But trusted mode *honors* the allowlist, and the allowlist was still mangled → still
   thrashed. So **#42 is correct and is KEEP** — a prerequisite, not the bug.
5. **"Siblings have the same bug / likely thrash" (a #43 claim)** — FALSIFIED:
   rogue-descent's `review-and-merge` shows 8 consecutive `success` runs on real
   `pull_request` events. Siblings DO auto-merge. The difference is **FORMAT, not content.**
6. **Space-free patterns as THE fix (a #43 proposal)** — UNVERIFIED and likely the
   wrong frame: the issue is the YAML **serialization**, not the pattern content.

### THE FIX (next session — verify FIRST, then one PR)
- **STEP 1 — verify the format differentiator (do NOT skip):** diff our
  `claude-review.yml` `claude_args` block against a sibling's (rogue-descent /
  neon-drift) **verbatim**. Confirm whether siblings use a single-line **quoted**
  `--allowedTools "...,..."` while ours uses the multiline `claude_args: |` block.
  Per issue #844 the fix is the quoted single-line form. **Match whatever format the
  WORKING siblings use, exactly.**
- **STEP 2 — the fix PR:** change ONLY the `claude_args` **serialization** in
  `claude-review.yml` to the working form (quoted single-line `--allowedTools`, or the
  exact sibling format). **Keep the allowlist CONTENT** (incl. `Bash(gh pr:*)` etc.) —
  content was never the bug. Manual-merge (edits claude-review.yml → `paths-ignore`
  skips its own review).
- **STEP 3 — prove it:** after merge, a NORMAL lib/-only PR should auto-merge
  hands-off. If it does → auto-merge DONE. If not → the telemetry dumps the denials;
  read them.

**WATCH-POINT:** the loop-prevention guards check `github-actions[bot]` as the
push-back author; with the OIDC App token the push-back may author as a different bot
login. If a fix-push ever loops, update **both** guards (job `if:` + check-author step)
to the App's actual login.

---

## REMAINING TAIL (all lower-risk, none blocking)

- **`plan: auto-merge-format-fix`** — STEP 1/2/3 above. **THE next thing.**
- **`plan: security-jsyaml`** — `js-yaml@3.14.2` old major in the tree (`pnpm why` →
  scoped override or accept-with-reason; root: an unused `react-spring`→metro native chain).
- **`plan: security-md`** — add `SECURITY.md` (root file → its own PR; untrusted mode).
- **`plan: prod-seo`** — typed `app/robots.ts` / `app/sitemap.ts` (static versions work today).
- **`plan: lighthouse-ci`** — `lighthouse.yml` (low priority).
- **`plan: semgrep-purity`** — enforce no React/DOM in `lib/services` + `lib/slices`.
- **`plan: nvmrc`** — add `.nvmrc` (22) to match `engines` + the fleet (trivial).
- **OUT-OF-REPO — `plan: pr-pipeline-enroll`** — add `cao825/v0-word-archipelago` to
  the `REPOS` array in `/Users/craigoleyagent/Scripts/pr-pipeline.sh` (operator
  action; the array is `craigoley`-owned).

---

## PROCESS NOTES (what worked — keep doing)

- **Recon-first + falsify-before-claiming** caught every latent bug as a ratchet
  (the #16 override pairing, the log-injection, the 6 auto-merge hypotheses). Keep it.
- **Add telemetry BEFORE changing filter logic** — the #40 execution-dump is what
  finally cracked auto-merge after 5 inference-driven misses.
- **"Match the siblings" is sound ONLY against VERIFIED-working sibling runs** —
  confirm a sibling actually succeeds before treating its config as ground truth
  (the #43 lesson: a sibling config was assumed broken when its runs were green).

## Explicitly NOT proposed (done / N-A — do not create)
- ❌ scanners, `ci.yml`, branch protection, lint, deterministic tests, CLAUDE.md,
  constants, productionization, canonical domain — **done**.
- ❌ "add strict TS" / "enforce build types" — done (#9 / #17 / #18).
- ❌ Three.js purity, procedural assets, synthesized audio, game-loop / pool /
  timestep, joystick parity, visual-PR draft-gate — **N-A for this stack** (see CLAUDE.md).
- ❌ "kill dead `pnpm.overrides`" — it's LIVE.
