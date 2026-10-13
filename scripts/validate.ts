// npm run validate — prints the balance and reachability report. Exits 1 on any error.
import { existsSync } from 'node:fs';
import { CONFIG } from '../src/core/config';
import { OPPONENTS } from '../src/data/opponents';
import { PORTRAIT_FILE } from '../src/data/portraits';
import { CARDS } from '../src/data/cards';
import { checkBudgets, checkIntegrity, checkReachability, routeCounts } from '../src/data/validate';

const errs = [...checkIntegrity(), ...checkBudgets(), ...checkReachability()];

// Portrait files (warnings only: a missing file shows the placeholder).
const pic = (f: string) => existsSync(`public/portraits/${f}.webp`);
const noArt = [
  ...CARDS.filter((c) => !c.art && !pic(PORTRAIT_FILE[c.id] ?? c.id)).map((c) => c.id),
  ...OPPONENTS.filter((o) => o.portrait && !pic(o.portrait)).map((o) => `opponent ${o.id}`),
];
console.log(noArt.length ? `Missing portraits (${noArt.length}): ${noArt.join(', ')}` : 'Portraits: all present.');

console.log('Stat budgets by rarity:');
for (const [rarity, b] of Object.entries(CONFIG.budgets)) {
  const cards = CARDS.filter((c) => c.rarity === rarity);
  const sums = cards.map((c) => c.values.reduce((a, v) => a + v, 0));
  const avg = sums.length ? (sums.reduce((a, v) => a + v, 0) / sums.length).toFixed(1) : '-';
  console.log(`  ${rarity.padEnd(8)} ${String(cards.length).padStart(3)} cards  budget ${b.min}-${b.max}  avg ${avg}`);
}

const runes: Record<string, number> = {};
for (const c of CARDS) runes[c.rune] = (runes[c.rune] ?? 0) + 1;
console.log('Rune affinities:', runes);

const routes = routeCounts();
const single = Object.entries(routes).filter(([, r]) => r.prize + r.quest + r.bond + r.story === 1).map(([id]) => id);
console.log(`Cards with only one route: ${single.length}`);

const flagged = CARDS.filter((c) => c.flag);
console.log(`Flagged roster entries: ${flagged.length}`);
for (const c of flagged) console.log(`  - ${c.name}: ${c.flag}`);

if (errs.length) {
  console.error(`\n${errs.length} error(s):`);
  for (const e of errs) console.error('  ✗ ' + e);
  process.exit(1);
}
console.log('\n✓ All checks passed.');
