# Suikoden Triple Triad + Quad Quartet

A fan-made card duel game based on Final Fantasy VIII's Triple Triad, with a Suikoden II theme. It runs only in the browser: no server, no accounts, no network calls.

- **Triple Triad:** 3×3 board, 5-card deck.
- **Quad Quartet:** 4×4 board, 8-card deck, cost cap 30.

## Commands

```sh
npm install
npm run dev        # http://localhost:5173
npm test           # rules engine, AI, data, progress, tutorial
npm run validate   # stat budgets + reachability report
npm run check      # svelte-check (types)
npm run build      # static site in dist/
```

## Portrait art

Card and opponent art is in `public/portraits/<file>.webp`. The default file name is the card id (third column in `src/data/cards.ts`). When a file name is different (for example `riou` for `hero`), add it to `src/data/portraits.ts`. Opponent art is set with `portrait` in `src/data/opponents.ts`. A missing file shows the placeholder. `npm run validate` lists missing files.

## Structure

| Folder | Content |
| --- | --- |
| `src/core/` | Pure TypeScript. `engine.ts` (rules), `match.ts` (coin flip, handicap, best of two, game log), `progress.ts` (recruiting, gates, prizes), `config.ts` (all tunable numbers), `rng.ts` (seeded random). |
| `src/ai/` | `search.ts` (negamax + alpha-beta, iterative deepening, time budget), `worker.ts` (web worker), `client.ts` (removes the player's hand from the AI's view). |
| `src/data/` | Cards, bonds, regions and opponents, recruit quests, tutorial lessons, `validate.ts`. |
| `src/stores/` | Save data (versioned, with migrations) and navigation. |
| `src/components/` | Svelte 5 UI. |
| `tests/` | Vitest tests. |
| `scripts/validate.ts` | Balance and reachability report. |

## Rules in this build

- A higher facing value flips an adjacent enemy card. No diagonals.
- **Same** / **Plus**: 2+ sides (config `sameThreshold`, `plusThreshold`). Board edges never count. Own cards count as matches but do not flip.
- **Combo**: cards flipped by Same or Plus attack their neighbors with the basic rule, and the chain continues.
- **Rune tiles**: matching rune +1 on all sides, other rune −1. Values stay in 1–10.
- **Bonds**: a card that touches an allied bond partner gets +1 on **all** sides (one bonus at most). See assumption 1.
- **Unite Attack**: when a formation (3–4 bonded cards in the bond's shape) is complete, the owner flips the adjacent enemy card with the lowest touching value. Once per duel per side. No chain.
- **Parity**: casual duels give +1 to one card of the side at the disadvantage (3×3: second player, 4×4: first player). Bosses play best of two; the first player switches; total cards break a 1–1 tie.
- Hands are hidden. The AI sees face-down stand-ins (5/5/5/5) for your cards.

## Progression

- 6 regions, 18 opponents (one boss per region). A region opens when you beat the previous boss **or** own enough cards.
- Recruit routes: duel prizes, recruit quests (at most one per duel), and bond recruits (own the listed cards). Jowy and Luca Blight are story cards from boss duels.
- `npm run validate` proves every card is reachable in both modes.

## Assumptions (please check)

1. **Bond bonus.** The brief says "the touching edges each get +1". Allied cards never fight each other, so that bonus would have no effect. This build gives +1 to all sides of a card while it touches an allied partner.
2. **Parity handicap.** The coin flip decides the first player. The side at the disadvantage gets the +1 boost (not always the flip loser).
3. **Unite Attack** flips the enemy card with the lowest touching value (ties: lowest total, then board order).
4. **"Win without losing a card"** means the opponent never flipped any of your cards in the match.
5. **Losing a duel costs no cards.** Only the winner claims a prize.
6. **108 Stars + 2 story cards = 110 cards.** No alternates. The Hero is 'special' (cost 5) but stays Star 1.
7. **Rune affinities** are game design, not canon.
8. **Opponents in Triple Triad** use a seeded 5 of their 8 cards.
9. **Tavern** shows 3 rumors, plus one more per win.

## Roster notes (please correct)

The 108 Stars list was checked against [Gensopedia: 108 Stars](https://gensopedia.org/w/108_Stars) and the [RPGSite recruitment guide](https://www.rpgsite.net/guide/16986-suikoden-ii-recruitment-guide-how-to-get-all-108-star-destiny-characters).

- **Star 2 (Tengou):** Ridley is used. Boris Wizen can take this star in the game.
- **Stars 12 and 25 (Tenman, Tentai):** two of Feather, Siegfried, and Abizboah. Feather and Abizboah are used.
- **Stars 14 and 59 (Tensho, Chikyuu):** Valeria or Kasumi is a player choice. Valeria is used, and Tomo takes Star 59.
- **Star names** use the Gensopedia romanization. Several names repeat (Tenyuu ×3, Chiyuu ×4, Chikou ×3). Please check the readings.
- **Jowy and Luca Blight** are not among the 108. They are story cards.

If you want Boris, Kasumi, or Siegfried as extra alternate cards, that makes 113 cards. Tell me and I will add them.

## Phase 2 hooks (data only, not built)

- `Rules.open`, `Rules.random`, `Rules.suddenDeath` exist in the type. The engine ignores them.
- `CardDef.art` can point to an explicit image.
- `SaveData.castle` and `SaveData.cardBack` exist for meta-progression and cosmetics.
- Add a save format change with a function in `MIGRATIONS` (`src/stores/saveData.ts`).
