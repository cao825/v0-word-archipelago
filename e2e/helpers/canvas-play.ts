import { type Page, expect } from "@playwright/test"
import { dictionary } from "../../lib/utils/dictionary"

// Canvas-play helper (PR-B exploration). The island board is a <canvas> with no DOM
// tiles, BUT the game is observable from the DOM:
//   - a real island click ENABLES the "Submit word" button (selection registered);
//   - the formed word renders to LiveWordDisplay (`div.font-mono`) after framer-motion
//     settles (~up to 1.5s — must be waited for, not read immediately);
//   - the "Clear selection" button resets the selection.
// So we discover the board empirically: grid-probe, detect a hit via Submit-enabled,
// read the letter from the DOM, dedup by proximity. Mapping (island-map.tsx): a click
// at screen (sx,sy) maps to logical ((sx-rect.left)/scale, ...) and hits an island
// within ~max(size,22)px; islands are size 35-42 so they are large targets.
//
// Investigation scaffolding — the exploration spec that uses it is CI-skipped.

const DICT = new Set(dictionary.map((w) => w.toLowerCase()))

export type Tile = { sx: number; sy: number; letter: string }

const submitBtn = (p: Page) => p.getByRole("button", { name: "Submit word" })
const clearBtn = (p: Page) => p.getByRole("button", { name: "Clear selection" })

export async function startGame(page: Page): Promise<void> {
  await page.goto("/")
  await page.getByRole("button", { name: "Start Game" }).click()
  await expect(page.getByTestId("score-value")).toBeVisible()
}

export async function readWord(page: Page): Promise<string> {
  const fm = page.locator("div.font-mono").first()
  try {
    await fm.waitFor({ timeout: 1500 })
    return ((await fm.textContent()) ?? "").trim().toLowerCase()
  } catch {
    return ""
  }
}

export async function readScore(page: Page): Promise<number> {
  return Number((await page.getByTestId("score-value").textContent())?.trim() || "0")
}

export async function selectionActive(page: Page): Promise<boolean> {
  return !(await submitBtn(page).isDisabled())
}

export async function clearSelection(page: Page): Promise<void> {
  for (let i = 0; i < 4 && (await selectionActive(page)); i++) {
    await clearBtn(page).click().catch(() => {})
    await page.waitForTimeout(80)
  }
}

export async function canvasBox(page: Page) {
  const box = await page.locator("canvas").first().boundingBox()
  if (!box) throw new Error("canvas not found")
  return box
}

// Grid-probe the canvas, collecting every (point, letter) hit, then cluster: hits with
// the SAME letter within ~50px are one island (islands are >=85px apart, so distinct
// islands don't merge). Each cluster's centroid is the tile to click later.
export async function discoverTiles(page: Page): Promise<Tile[]> {
  const box = await canvasBox(page)
  const step = 22
  await clearSelection(page)
  const hits: Tile[] = []
  for (let sy = box.y + 12; sy < box.y + box.height - 12; sy += step) {
    for (let sx = box.x + 12; sx < box.x + box.width - 12; sx += step) {
      await page.mouse.click(sx, sy)
      if (await selectionActive(page)) {
        const w = await readWord(page)
        const letter = w.slice(-1)
        if (w.length === 1 && /[a-z]/.test(letter)) hits.push({ sx, sy, letter })
        await clearSelection(page)
      }
    }
  }
  // Cluster same-letter hits within 50px.
  const clusters: { letter: string; xs: number[]; ys: number[] }[] = []
  for (const h of hits) {
    const c = clusters.find(
      (cl) => cl.letter === h.letter && Math.hypot(cl.xs[0] - h.sx, cl.ys[0] - h.sy) < 50,
    )
    if (c) {
      c.xs.push(h.sx)
      c.ys.push(h.sy)
    } else {
      clusters.push({ letter: h.letter, xs: [h.sx], ys: [h.sy] })
    }
  }
  return clusters.map((c) => ({
    letter: c.letter,
    sx: Math.round(c.xs.reduce((a, b) => a + b, 0) / c.xs.length),
    sy: Math.round(c.ys.reduce((a, b) => a + b, 0) / c.ys.length),
  }))
}

// Greedy: from a start tile, keep clicking the nearest not-yet-used tile the game
// ACCEPTS (the word grows — i.e. it was connected). STOPS the moment the live word is a
// valid dictionary word (>= 2 letters), so the on-screen selection == the returned word
// exactly. Returns that word, or null if no valid word reached from this start.
async function growFrom(page: Page, start: Tile, tiles: Tile[]): Promise<string | null> {
  await clearSelection(page)
  await page.mouse.click(start.sx, start.sy)
  let word = await readWord(page)
  if (!word) return null
  const used = new Set<Tile>([start])
  for (let depth = 0; depth < 5; depth++) {
    if (word.length >= 2 && DICT.has(word)) return word
    const last = [...used][used.size - 1]
    const candidates = tiles
      .filter((t) => !used.has(t))
      .sort((a, b) => Math.hypot(a.sx - last.sx, a.sy - last.sy) - Math.hypot(b.sx - last.sx, b.sy - last.sy))
      .slice(0, 6)
    let extended = false
    for (const c of candidates) {
      await page.mouse.click(c.sx, c.sy)
      const w = await readWord(page)
      if (w.length > word.length) {
        word = w
        used.add(c)
        extended = true
        break
      }
    }
    if (!extended) break
  }
  return word.length >= 2 && DICT.has(word) ? word : null
}

// Find + leave selected a valid word; returns the word string or null.
export async function formValidWord(page: Page, tiles: Tile[]): Promise<string | null> {
  for (const start of tiles) {
    const w = await growFrom(page, start, tiles)
    if (w && (await readWord(page)) === w) return w
    await clearSelection(page)
  }
  return null
}

export async function submit(page: Page): Promise<void> {
  await page.keyboard.press("Enter")
  await page.waitForTimeout(400)
}
