// Central tuning constants for Word Archipelago. Names only — extracting these
// inline magic numbers does not change any value or behavior.

// --- Timing ---
/** Length of a round, in seconds (2 minutes). */
export const GAME_DURATION_SECONDS = 120
/** Window for chaining words into a combo, in milliseconds (15 seconds). */
export const COMBO_TIME_WINDOW_MS = 15000

// --- Scoring ---
/** Base points awarded per letter in a found word. */
export const POINTS_PER_LETTER = 10
/** Combo length at which the combo bonus starts applying. */
export const COMBO_BONUS_THRESHOLD = 3
/** Bonus fraction of the base score per combo level above the threshold. */
export const COMBO_BONUS_RATE = 0.5
/** Points awarded for completing a single objective. */
export const OBJECTIVE_COMPLETION_BONUS = 50
/** Minimum word length that counts as a "bonus" word. */
export const BONUS_WORD_MIN_LENGTH = 6

// --- Board generation ---
/** Minimum number of islands generated per board. */
export const MIN_ISLANDS = 12
/** Extra islands added on top of the minimum (so MIN..MIN+VARIANCE-1). */
export const ISLAND_COUNT_VARIANCE = 5
/** Size of the square game board, in px. */
export const BOARD_SIZE = 600
/** Minimum distance between two islands, in px. */
export const MIN_ISLAND_DISTANCE = 85
/** Probability that an island gets a score multiplier. */
export const MULTIPLIER_CHANCE = 0.2
/** Probability (of multiplier islands) that the multiplier is 3x rather than 2x. */
export const TRIPLE_MULTIPLIER_CHANCE = 0.05

// --- Leaderboard ---
/** Max entries kept in the local leaderboard fallback. */
export const MAX_LEADERBOARD_ENTRIES = 1000
/** Number of entries shown in a leaderboard view (top N). */
export const LEADERBOARD_DISPLAY_LIMIT = 10
/** Cooldown between leaderboard submissions, in milliseconds (client-side UX hint). */
export const LEADERBOARD_SUBMISSION_COOLDOWN_MS = 5000
/**
 * Server-side maximum accepted score. A generous ceiling that rejects only the absurd:
 * a loose theoretical best game (120s, up to ~60 words, a 16-island word = 160 base,
 * ×3 multiplier, plus escalating combo bonuses) tops out around ~170k, so 1,000,000 is
 * ~6× headroom — it never rejects a real game but blocks junk like 999,999,999.
 */
export const MAX_LEADERBOARD_SCORE = 1_000_000
/** Max accepted value for the words_found / objectives_completed metadata counters. */
export const MAX_LEADERBOARD_COUNTER = 1000
/** Server-side rate limit on leaderboard writes: max writes per window, per client IP. */
export const LEADERBOARD_RATE_LIMIT = 10
/** Rate-limit window (seconds) for {@link LEADERBOARD_RATE_LIMIT}. */
export const LEADERBOARD_RATE_WINDOW_SECONDS = 60
