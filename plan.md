# plan.md — state + roadmap (v4)

**Supersedes v3 (PR #19).** 29 PRs merged since (#20–#48): the full hardening pass
landed — scanners, lint, deterministic tests, Tailwind v4, CI gate, branch
protection, CLAUDE.md, constants, typed SEO routes — and **hands-off auto-merge now
WORKS** (root cause found + fixed in #47, proven in #48). This records the DONE state,
the load-bearing invariants, the auto-merge saga with its confirmed root cause, and
the remaining tail.

This is the **state/roadmap** doc. [`CLAUDE.md`](./CLAUDE.md) is the **hard-rules**
doc — they agree: CLAUDE.md says "auto-merge on green," and as of #47/#48 that is
**LIVE** — claude-review reviews and merges hands-off (`mergedBy=app/claude`). See
the saga below for the root cause and the forward-bump watch-point.

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
- **HANDS-OFF AUTO-MERGE: CONFIRMED WORKING (#47 / #48).** The thrash was a stale
  `claude-code-action` SHA carrying a whitespace-split regression; #47 pinned the
  siblings' last-known-good commit and #48 (lib/-only) then auto-merged hands-off —
  `permission_denials_count=0`, allowlist intact, 14 turns, `mergedBy=app/claude`. See
  the saga below (incl. the forward-bump watch-point and the full ruled-out list).
- **Determinism:** the last `Math.random()` leak (`assignMultipliers` in
  `islandGenerator.ts`) is now hour-seeded too — boards fully reproducible (#48).
- **Typed SEO routes:** `app/robots.ts` + `app/sitemap.ts` (Metadata Routes) replace
  the static files; `SITE_URL` centralized in `lib/site-config.ts` (#46).

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
10. **`claude-code-action` is pinned to `@d5726de0` (Claude Code 2.1.177) — the
   last-known-good BEFORE the `claude_args` whitespace-split regression.** The `# v1`
   comment is cosmetic; the SHA is what matters (it matches the working siblings). A
   forward-bump MUST re-verify `permission_denials_count=0` on a test PR first —
   bumping blindly to a newer commit can re-introduce the regression. Pin by SHA, and
   when comparing to siblings, **diff the SHA, not the tag**.

---

## AUTO-MERGE SAGA + CONFIRMED ROOT CAUSE (RESOLVED)

**State: SOLVED.** Branch protection + the gates + the fail-safes (is_error gate) +
the telemetry all work, and **hands-off auto-merge now fires** (#47 fix, #48 proof).
The root cause is confirmed by direct evidence, not inference.

### THE ROOT CAUSE — a stale `claude-code-action` SHA
`claude-review.yml` pinned `claude-code-action@2fee1551` (**Claude Code 2.1.185**,
2026-06-20), which carries a `claude_args` **whitespace-split regression**: it splits
`--allowedTools` on whitespace, shredding every space-containing Bash pattern —
`Bash(gh pr:*)` → `"Bash(gh"`, `"pr:*)"`; `Bash(npx tsc:*)`, `Bash(pnpm test:*)`,
`Bash(pnpm lint:*)` likewise. Only space-free entries survived (`Edit`, `Read`,
`Bash(git:*)`, the mcp tool), so the reviewer was **denied** `gh pr` / `tsc` / `pnpm`
→ thrashed to the 50-turn cap → never merged.

The working siblings (rogue-descent + neon-drift) pin `@d5726de0` (**2.1.177**,
2026-06-13 — **8 commits EARLIER**, the last-known-good before the regression). Same
`claude_args`, same `# v1` tag — **the only differentiator was the action commit.**

### THE FIX + PROOF
- **#47** downgraded our pin `@2fee1551 → @d5726de0` (one line; everything else
  unchanged).
- **#48** (lib/-only, normal PR) then **AUTO-MERGED hands-off**:
  `permission_denials_count=0` (vs 30–51 before), allowlist parsed **intact** (no
  shredding), `subtype=success`, **14 turns** (vs the 51-turn cap),
  `mergedBy=app/claude`. **CONFIRMED.**

### ⚠️ CRITICAL WATCH-POINT — this is a DOWNGRADE, not an upgrade
`@d5726de0` is *older* than the buggy `@2fee1551`. A future **forward-bump** of
`claude-code-action` MUST re-verify `permission_denials_count=0` on a test PR before
trusting it — bumping blindly to "latest v1" **re-introduces** the regression. **Pin
by SHA; diff the SHA, not the `# v1` tag** (the tag camouflaged an 8-commit gap from
the siblings — both said `# v1`).

### RULED-OUT HYPOTHESES (all were symptoms / adjacent layers — never re-chase)
1. **Missing Grep/Glob** — siblings lack them too and work.
2. **Missing `Bash(gh api:*)` (#40)** — it has a space, was shredded too; never took effect.
3. **Config files force untrusted (#40)** — #43 was lib/-only and still thrashed.
4. **Untrusted token / OIDC (#42)** — REAL + necessary but **additive, not the cause**:
   removing `github_token` + the Claude App install got us to *trusted* mode; **KEEP it**
   (a prerequisite — trusted mode is what lets the now-intact allowlist be honored).
5. **"Siblings also thrash"** — falsified: rogue-descent had 8 consecutive `success` runs.
6. **YAML block-scalar format / issue #844 (the prior "confirmed" claim)** — FALSIFIED:
   the siblings use the **byte-identical** `claude_args: |` block scalar and merge fine;
   the format was never the variable. (The block scalar IS whitespace-split — but only
   by *our* action version, not the siblings'.)
7. **Pre-action env setup (#45)** — falsified: removing the pnpm/Node/install steps that
   ran before the action changed the split **not at all** (#46 still thrashed identically).

→ **The bug traveled with the ACTION VERSION.** Lesson: when a config looks identical
to a working sibling's, **diff the pinned SHA** — a shared `# v1` tag can hide a
multi-commit gap, and a regression can live entirely inside the action.

**SECONDARY WATCH-POINT (bot login):** the loop-prevention guards check
`github-actions[bot]` as the push-back author. With the OIDC App token a *fix-push*
may author as a different login (e.g. `claude[bot]`); #48 only exercised review→merge
(no fix-push). If a fix-push ever loops, update **both** guards (job `if:` +
check-author step) to the App's actual login.

---

## REMAINING TAIL (all lower-risk, none blocking)

- **`plan: review-pnpm-readd`** — re-add pnpm/Node setup **AFTER** the action so the
  fix-PUSH path has `pnpm test`/`pnpm lint` (#45 removed those pre-action steps; #48
  proved the review→merge happy path doesn't need them, but a reviewer pushing a fix
  would). Workflow-only → its own PR; keep the action SHA untouched.
- **`plan: security-jsyaml`** — `js-yaml@3.14.2` old major in the tree (`pnpm why` →
  scoped override or accept-with-reason; root: an unused `react-spring`→metro native chain).
- **`plan: security-md`** — add `SECURITY.md` (root file → its own PR; untrusted mode).
- **`plan: lighthouse-ci`** — `lighthouse.yml` (low priority).
- **`plan: semgrep-purity`** — enforce no React/DOM in `lib/services` + `lib/slices`.
- **`plan: nvmrc`** — add `.nvmrc` (22) to match `engines` + the fleet (trivial).
- **OUT-OF-REPO — `plan: pr-pipeline-enroll`** — add `cao825/v0-word-archipelago` to
  the `REPOS` array in `/Users/craigoleyagent/Scripts/pr-pipeline.sh` (operator
  action; the array is `craigoley`-owned).

---

## PROCESS NOTES (what worked — keep doing)

- **Recon-first + falsify-before-claiming** caught every latent bug as a ratchet
  (the #16 override pairing, the log-injection, the 7 ruled-out auto-merge hypotheses).
  Keep it — note how often a "confirmed" cause (e.g. the #844/YAML claim) was later
  falsified; hold diagnoses loosely until a PROOF run lands.
- **Add telemetry BEFORE changing filter logic** — the #40 execution-dump is what
  finally cracked auto-merge after several inference-driven misses.
- **"Match the siblings" is sound ONLY against VERIFIED-working sibling runs** —
  confirm a sibling actually succeeds before treating its config as ground truth.
- **When configs look identical to a working peer, diff the pinned SHA, not just the
  text** — the auto-merge bug lived entirely in the action commit; a shared `# v1`
  tag hid an 8-commit gap (the #47/#48 lesson).

## Explicitly NOT proposed (done / N-A — do not create)
- ❌ scanners, `ci.yml`, branch protection, lint, deterministic tests, CLAUDE.md,
  constants, productionization, canonical domain, **hands-off auto-merge** (#47/#48),
  **typed SEO routes** (#46) — **done**.
- ❌ "add strict TS" / "enforce build types" — done (#9 / #17 / #18).
- ❌ Three.js purity, procedural assets, synthesized audio, game-loop / pool /
  timestep, joystick parity, visual-PR draft-gate — **N-A for this stack** (see CLAUDE.md).
- ❌ "kill dead `pnpm.overrides`" — it's LIVE.
