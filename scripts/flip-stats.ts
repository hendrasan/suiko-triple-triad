// npm run stats:flips — AI-vs-AI duels against every opponent. Shows how often a won game has a
// move with N+ flips, per board size and rule set. Use it to tune 'flips' recruit quests.
import { chooseMove, PERSONALITIES, redact } from '../src/ai/search';
import { applyMove, createGame, isOver, score } from '../src/core/engine';
import { newLog, record, tilesFor, toHand, opponentDeck } from '../src/core/match';
import { makeRng, shuffle } from '../src/core/rng';
import { BONDS } from '../src/data/bonds';
import { CARDS } from '../src/data/cards';
import { OPPONENTS } from '../src/data/opponents';
const pool = CARDS.filter((c) => c.rarity === 'common' || c.rarity === 'rare').map((c) => c.id);
const out: Record<string, { won: number; f: number[] }> = {};
let seed = 1;
for (const mode of [3, 4] as const) {
  for (const opp of OPPONENTS) {
    const key = `${mode}x${mode} ${opp.rules.same || opp.rules.plus ? (opp.rules.combo ? 'same/plus+combo' : 'same/plus') : 'base'}`;
    out[key] ??= { won: 0, f: [0, 0, 0, 0, 0] };
    for (let g = 0; g < (mode === 3 ? 12 : 5); g++) {
      const rng = makeRng(seed++);
      const pDeck = shuffle(rng, pool).slice(0, mode === 3 ? 5 : 8);
      let s = createGame({ size: mode, rules: opp.rules, tiles: tilesFor(opp, mode), hands: [toHand(pDeck, 0), toHand(opponentDeck(opp, mode, seed), 1)], first: (g % 2) as 0 | 1, bonds: BONDS });
      const log = newLog(s.first);
      while (!isOver(s)) {
        const m = chooseMove(redact(s, s.turn), { depth: 2, noise: 0.3, weights: PERSONALITIES.balanced, timeMs: 60, seed: seed++ });
        const r = applyMove(s, m, BONDS); record(log, s, m, r); s = r.state;
      }
      const sc = score(s);
      if (sc[0] > sc[1]) { out[key].won++; for (let n = 1; n <= 4; n++) if (log.flipsMax >= n) out[key].f[n]++; }
    }
  }
}
for (const [k, v] of Object.entries(out)) console.log(k.padEnd(26), 'wins', String(v.won).padStart(3), ' flips>=2', (100 * v.f[2] / v.won).toFixed(0) + '%', ' >=3', (100 * v.f[3] / v.won).toFixed(0) + '%', ' >=4', (100 * v.f[4] / v.won).toFixed(0) + '%');
