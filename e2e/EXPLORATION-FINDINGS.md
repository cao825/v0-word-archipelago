# Word Isles — Playwright Exploration Findings (PR-B)

Investigation using the PR-A Playwright infra. **Deliverable = this report.** No game/app
fixes were made (the one code artifact is `e2e/helpers/canvas-play.ts` + the CI-skipped
`e2e/exploration.spec.ts`). Each finding is tagged **severity** (high/med/low) + **effort**
(S/M/L) and **confidence** (🟢 observed directly · 🟡 suspected / not fully verified).

Date: 2026-06-22. Versions: Next 16.2.9, React 19.2.7.

---

## Phase 1 verdict — can canvas tile-play be automated? **PARTIALLY (YES for observation, flaky for full play).**

The island board is a `<canvas>` (`island-map.tsx`), so there are **no DOM tiles**. But the
game is partly observable from the DOM, which makes *some* automation possible:

- A real island click maps deterministically — `logicalX = (clientX − rect.left) / scale`,
  hit if within `max(size, 22)px`; islands are size 35–42 (big targets). **🟢 verified** —
  individual clicks register (the "Submit word" button enables) and the formed word renders
  to `LiveWordDisplay`.
- The board is **hour-seeded** (`seedRandom("YYYY-MM-DD-HH")`), so the layout is deterministic
  within an hour; the helper discovers it empirically at runtime, so it's robust to that.

**But a full deterministic playthrough (discover → form a specific valid word → score) was
NOT reliably automatable**, for reasons that are themselves findings:
1. `LiveWordDisplay` uses framer-motion `AnimatePresence mode="wait"`, so the formed word only
   appears after the exit animation (~1.5s) — reads must `waitFor`, not read immediately.
2. **Selection state is hard to reset deterministically** in fast automation — `Clear`/`Escape`
   intermittently left a stale selection (the formed word accumulated, e.g. a single-tile
   click read back as `"ias"`).
3. Rapid clicks on the same large island trip the **double-tap → submit** path (300ms window,
   `island-map.tsx:813`), scrambling state during grid discovery.

→ The helper reliably discovers tiles and drives single selections; it does **not** reliably
produce a clean scored word in automation. **Scoring was therefore verified by code inspection,
not live automated play** (see below). *This low automatability is itself a finding (🟡):
the game is hard to E2E-test end-to-end precisely because its core state lives in canvas pixels
+ JS memory, not the DOM.*

---

## 🐞 BUGS / correctness

| # | Finding | Sev | Eff | Conf |
|---|---------|-----|-----|------|
| B1 | **Double-tap → submit on a single island.** Two taps on the same island within 300ms (`island-map.tsx:813` → `onIslandDoubleTap` → `submitWord`) submits the *current* selection. On a fast/imprecise tap this can submit a 1–2-letter or unintended word unexpectedly. Surfaced repeatedly as state corruption while automating rapid clicks. | med | S | 🟡 |
| B2 | **No console errors / pageerrors / failed requests** observed during cold load, game start, and selection. Clean on the happy path. | — | — | 🟢 (positive) |
| B3 | **Scoring not verifiable via automation** (per Phase 1). By code: `baseWordScore = word.length × POINTS_PER_LETTER(10)`, × highest tile multiplier, + combo bonus (3+ words in the 15s window). Not independently confirmed against live play here — flagged for a PR-B follow-up once selection-reset is solved. | — | — | 🟡 |

---

## 🧭 UX FRICTION

| # | Finding | Sev | Eff | Conf |
|---|---------|-----|-----|------|
| U1 | **No onboarding / instructions.** A first-time player sees a canvas of lettered islands + a "Start 2-Minute Game" button but is **never told the core mechanic** (tap to connect *adjacent* islands into words). No "how to play / tap / connect / drag" text exists pre-game; the only hint, "Select islands to form words", appears *after* starting. The canvas has no DOM affordance, so the rule is undiscoverable. Affects every new player. | high | S–M | 🟢 |
| U2 | **The connectivity rule is invisible.** Only *connected* islands can chain; an invalid pick triggers a shake/toast but the *rule* is never explained. Players learn by trial-and-error. | med | M | 🟢 |
| U3 | Invalid / duplicate / too-short submissions **are** communicated (`GameNotification` renders `state.message`, e.g. "You've already found this word!") and an invalid connection shakes. | — | — | 🟢 (positive) |
| U4 | **Responsive works** — at 390×844 (phone) the canvas and Start button render and are usable. | — | — | 🟢 (positive) |

---

## ♿ ACCESSIBILITY (the headline gap)

| # | Finding | Sev | Eff | Conf |
|---|---------|-----|-----|------|
| A1 | **The core game is keyboard- and screen-reader-inaccessible.** The board `<canvas>` has `tabIndex = -1` (not focusable); keyboard handles only Enter (submit) / Escape (reset) — **there is no keyboard path to select tiles**. Board state exists only as canvas pixels + JS, so a screen reader perceives nothing of the letters, positions, or connections. The game is unplayable without a mouse/touch. | high | L | 🟢 |
| A2 | **Automated a11y tooling misses A1 entirely.** `@axe-core/playwright` reports **0 violations** (pre-game and active), and Lighthouse a11y is **100** — *because there is nothing in the DOM to flag*. The DOM chrome is genuinely clean; the inaccessibility is invisible to the tools. A "100" here is a false sense of security. | high | — | 🟢 |

---

## 🛡️ ROBUSTNESS GAPS — `POST /api/leaderboard` (public, unauthenticated write)

Probed via the request fixture. The validation runs **before** the Redis call, so these are
credential-free: **400 = rejected at validation; 500 = passed validation** (Redis unavailable
locally — *in production these payloads would be stored*).

| # | Abusive input | Result | Meaning | Sev | Eff | Conf |
|---|---------------|--------|---------|-----|-----|------|
| R1 | `score: 999999999` | **500** | **No upper bound** — absurd scores pass validation → would pollute the leaderboard. | med | S | 🟢 |
| R2 | 8× rapid POST | **all pass** | **No server-side rate-limiting.** `LEADERBOARD_SUBMISSION_COOLDOWN_MS (5000)` is **client-only**; the endpoint accepts unlimited writes → leaderboard flooding. | med–high | M | 🟢 |
| R3 | `player_initials: "<img src=x onerror=...>"` | **500** | Passes validation; only mitigated by `substring(0,3)`+`toUpperCase` + React escaping at render (not defense-in-depth — no input sanitisation). Not confirmed exploitable. | low–med | S | 🟡 |
| R4 | `score: 1.5` | **500** | Non-integer scores accepted (data quality). | low | S | 🟢 |
| R5 | `score: -500` / `"abc"` / missing / `{}` | **400** | Correctly rejected (`score <= 0`, `typeof !== number`, missing fields). | — | — | 🟢 (positive) |
| R6 | extra fields (`isAdmin:true`) | **500** (ignored) | No mass-assignment (only `player_initials`/`score` read), but no schema validation either. | low | S | 🟢 |

These become a **leaderboard-hardening PR**: cap/validate score range, add server-side
rate-limiting (per-IP), and sanitise/strictly-validate `player_initials`.

---

## ✨ FEATURE OPPORTUNITIES (grounded in what was observed)

| # | Opportunity | Why (observed) | Eff |
|---|-------------|----------------|-----|
| F1 | **Onboarding / first-run tutorial overlay** | Directly fixes U1/U2 — the mechanic is currently undiscoverable. | S–M |
| F2 | **Accessible / keyboard play mode** (e.g. a DOM list of islands + their connections, selectable by keyboard) | Fixes A1 — the game is mouse-only today. | L |
| F3 | **Word definitions on found words** | It's a word game with a 2,305-word dictionary already in-repo; found words are listed but not defined. | S–M |
| F4 | **Daily/hourly challenge framing + streaks/stats** | The board is already hour-seeded + deterministic; there's no streak/stat surface to reward return play. | M |
| F5 | **Share card** (Wordle-style) | `share-results.tsx` exists but the hourly-deterministic board is a natural shareable. | S–M |

---

## Confidence summary

- **🟢 Observed directly:** the click→DOM mapping & single-selection automation; 0 console/page
  errors on the happy path; no onboarding text; feedback toasts present; responsive at phone size;
  canvas `tabIndex=-1` + keyboard has no tile-selection; axe 0 / Lighthouse-100 despite A1; the
  full endpoint-validation matrix (R1–R6).
- **🟡 Suspected / not fully verified:** B1 double-tap-submit (inferred from code + automation
  state-corruption, not isolated into a clean repro); B3 live scoring (verified by code, not play);
  R3 stored-XSS (passes validation but truncation + React escaping likely neutralise it).
- **Caveat (equal weight):** the inability to reliably automate a full scored playthrough is a
  real limitation of this exploration — and a signal that the game is hard to E2E-test. PR-B
  follow-up: solve selection-reset (avoid the double-tap window; wait between same-tile clicks)
  to enable functional scoring/objective/timer-expiry coverage.
