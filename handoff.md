# Suikoden Triple Triad — project handoff

A fan-made, browser-only card game: Final Fantasy VIII's Triple Triad with a Suikoden II theme. Two modes: **Triple Triad** (3×3, 5-card deck) and **Quad Quartet** (4×4, 8-card deck, cost cap 30). No server, no accounts; the save lives in `localStorage`. `README.md` has the rules, the content notes, and the asset instructions. Read it before content work.

## Working with the user

- Answer in **ASD-STE100 Simplified Technical English** (see the global CLAUDE.md). Prefer simple solutions.
- **Do not commit.** The user listens, plays, and commits by themselves. Commit only when asked.
- The user tunes balance and gameplay over time. Change numbers in `src/core/config.ts` or the data files, not the code structure.
- For UI work the user often asks for the `/emil-design-eng` skill. Report UI changes as a `| Before | After | Why |` table. The user gives direct visual feedback, and sometimes asks to revert. Keep changes in a small number of files, so a revert is easy.
- Before you report a change, verify it: run `npm run check`, `npm test`, `npm run validate`, then check the UI in headless Chrome (see "Verify UI" below) and look at the screenshots.

## Commands

```sh
npm run dev          # http://localhost:5173 (start it in the background)
npm test             # vitest: engine, AI, data, progress, tutorial (68 tests)
npm run check        # svelte-check (types)
npm run validate     # stat budgets, references, reachability of every card in both modes, portraits
npm run stats:flips  # AI-vs-AI simulation: how often won games have N+ flips in one move
npm run build
```

TypeScript is pinned to `~6`, because svelte-check does not support TypeScript 7 yet.

## Stack and layout

Svelte 5 (runes) + Vite + TypeScript + Vitest. Sound: `zzfx` (lazy-loaded).

| Path | Content |
| --- | --- |
| `src/core/` | Pure logic. `engine.ts` (rules: flips, Same, Plus, Combo, runes, bonds, formations/Unite, abilities), `match.ts` (setup, handicap, best of two, game log, summary), `progress.ts` (recruits, prizes, region gates, rumors, Richmond secrets), `config.ts` (all tunables), `rng.ts` (seeded), `types.ts` |
| `src/ai/` | `search.ts` (negamax + alpha-beta, iterative deepening, time budget, hidden-hand redaction), `worker.ts`, `client.ts` |
| `src/data/` | `cards.ts` (108 Stars + extras 109–112 + Jowy/Luca = 114), `bonds.ts`, `opponents.ts` (6 regions, 18 opponents), `recruits.ts` (quests, bond recruits, story gates, starters), `reports.ts` (Richmond's Investigations), `abilities.ts`, `formations.ts`, `tutorial.ts` (11 lessons), `tavern.ts` (rumor speakers), `portraits.ts` (file-name map), `schema.ts`, `validate.ts` |
| `src/stores/` | `saveData.ts` (versioned save, `SAVE_VERSION = 2`, `MIGRATIONS`), `save.svelte.ts` (reactive store + helpers), `nav.svelte.ts` (one `Screen` at a time) |
| `src/lib/` | `fx.ts` (ZzFX sounds, global menu click sounds via `data-sfx`, reduced motion), `music.ts` (two tracks, fades), `drag.ts` (pointer drag to board), `text.ts` |
| `src/components/` | Screens: `MapScreen` (World), `Prep` (pre-duel), `Duel`, `DeckBuilder`, `Collection` (Stars), `Tavern`, `Settings`, `Tutorial`. Parts: `Card`, `Board`, `Portrait`, `Avatar`, `RuneIcon`, `AbilityIcon`, `ShapeIcon`, `RuleChips` |
| `public/portraits/` | Card and opponent art, `.webp`, height 256, transparent background. Default file name = card id; exceptions in `src/data/portraits.ts` |
| `public/music/` | `funked-up.mp3` (battle, Joth, CC0), `etirwer.ogg` + `etirwer.m4a` (menus, Kistol, CC0) |
| `scripts/` | `validate.ts`, `flip-stats.ts` |

## Game rules as built (decisions and reasons)

- **Bonds:** a card that touches an allied bond partner gets +1 on all sides (at most +1). The brief said "touching edges +1", but allied cards never fight each other, so that bonus would do nothing.
- **Formations:** bonds of 3–4 members with a shape: `line`, `connected` (shown as **Group**), `square`. A complete shape gives a **Unite Attack** once per duel: it flips the touching enemy card with the weakest touching value.
- **Abilities** (20 Earthly Stars and some extras; each costs 2 stat points, `abilityStatCost`):
  - **Steadfast:** Same, Plus, and Combo cannot flip it.
  - **Rally:** adjacent allies get +1 on **all** sides. It follows the Rally card's current owner. It boosted only the touching side at first, which did nothing.
  - **Sabotage:** when placed, the strongest adjacent enemy loses 1 on the side that faces it, before attacks. The −1 is a lasting "wound" on the card.
  - **Rune-born:** +2 on a matching tile, and no penalty on other runes.
- **Parity handicap** (`handicapSide`): 3×3 none (the second player keeps an unflippable card in hand); 4×4 the first player boosts one card by +1. Casual duels only.
- **Boss duels: best of two, and you must win both games.** A game 1 loss or draw ends the match.
- **Prizes:** only `choose` ("Reward: Choose 1") and `random` ("Reward: Random"). A "highest" rule was removed. All bosses use Choose 1.
- **Recruiting:** prizes, quests (at most 1 quest recruit per match), bond recruits (own the listed cards), story gates (Jowy from the Muse boss, Luca from the Luca boss). Regions open by beating the previous boss **or** owning N cards.
- **Flip quests** use targets of 2 or 3 flips in one move. 3+ needs the Combo rule (simulation in `stats:flips`).
- **Tavern** shows 3 rumors, plus 1 per win. Each rumor has a fixed NPC speaker (hash of the card id).
- **Richmond's Investigations:** after Richmond is owned, each card has a profile and 1–3 secrets. One secret opens per won match with the card in the deck (`save.cardWins`; wins before Richmond also count).
- **3×3 has no deck cost cap** for now (the user decided). Only 4×4 has the cap of 30.

## Content conventions

- **Roster:** Stars 1–108 from Gensopedia (Ridley for Star 2, Feather + Abizboah for Tenman/Tentai, Valeria for Star 14, Tomo for Star 59). Extra cards: 109 Kasumi, 110 Sigfried, 111 Chuchara, 112 Rulodia (`extraNo`). The Hero is `special`, Jowy `special`, Luca `boss`. Stars 1–36 are Heavenly (rare), the others Earthly (common).
- **Reports** are rewritten in our own words from the game's Richmond text (facts only, no new facts). The user keeps the original text outside the repo. War-battle ability lines were dropped. Hero/Jowy/Luca were written from general knowledge; the user checked them (Hero and Jowy are 16, Luca is 27). The user wants game terms kept as in the game, for example Connell's note is "Phonologist".
- **New portraits:** crop off the white strip and frame line, keep transparency (no `flatten`), resize to height 256, save as WebP. The tool used was `sharp`, run from the scratchpad.
- Every new card needs: an entry in `cards.ts`, a route (prize / quest / bond / story) so `validate` reaches it in both modes, a `reports.ts` entry, and a portrait.
- **Save format change:** bump `SAVE_VERSION` and add a step to `MIGRATIONS`. `migrate()` fills new fields from defaults and drops unknown card ids.

## UI conventions

- Tokens in `src/app.css`: colors, `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, and a `.rise` entrance with `--i` stagger. Reduced motion (from the OS or Settings) turns animations off.
- Press feedback is `scale(0.97–0.98)`. Hover effects only inside `@media (hover: hover) and (pointer: fine)`.
- Card values sit as a diamond in the top-left corner; the rune icon is top-right, the ability icon bottom-left, the bond icon bottom-center, the owner mark bottom-right.
- Ownership colors: player blue with solid frame and ●, opponent orange with dashed frame, stripes, and ◆.
- Mobile: bottom tab bar. Desktop (≥ 960 px): left sidebar. Grids use `minmax(0, 1fr)` columns, and buttons in grids need `width: 100%` (that was a real bug).
- Menu sounds: every button and checkbox clicks by default. Set `data-sfx="nav|open|back|add|remove|none"` to change it.
- The card detail `<dialog>` animates in and out with `@starting-style` and an explicit closed state.
- The user's recent taste: simple and clean. Small corner radius on dialogue boxes, sans-serif body text, roomy gaps, no busy decoration. They rejected a drawn tavern scene and a typewriter dialogue.

## Recent state (end of the first session)

- Screens redesigned: World (journey path, "Next duel" card, lock progress), pre-duel (mode cards with mini rune maps, deck slot picker, pinned Duel bar; "Edit deck" returns with "← Back to {opponent}"), Stars ("Stars of Destiny", progress bars, All / Heavenly / Earthly filter), Tavern (rumor boxes with a cream NPC name plate).
- All work up to "npc dialogue ui" is committed. Check `git status` for anything newer.

## Open items and ideas

- The tutorial's Sabotage lesson preview does not name the weakened card (the duel preview does).
- Possible later: a 3×3 cost cap if 3×3 decks become "top 5 cards only"; more opponents (portraits exist for Leon, Yuber, Agares, Culgan); Boris as an extra card; Phase 2 hooks (`Rules.open/random/suddenDeath`, `SaveData.castle`, `cardBack`).

## Verify UI (headless Chrome)

The user declined the Claude in Chrome extension. Use `puppeteer-core` with the installed Chrome instead:

- Install it in the scratchpad folder (not in the project). The scratchpad can be cleared between sessions, so reinstall when needed.
- Chrome path: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`, `headless: 'new'`.
- Test sizes: phone 390×844 (`isMobile`, `hasTouch`) and desktop 1280×800.
- Set up a test save: write a `SaveData` JSON to `localStorage['suiko-tt-save']` (version 2, with `cardWins`, `settings.music`), then reload.
- Collect console errors and page errors, and take screenshots to look at.
- The header star counter also uses the class `.count`, so use a more exact selector when a screen has its own `.count`.
- Svelte 5: `{@const}` must be a direct child of a block (`{#each}`, `{#if}`, …).
