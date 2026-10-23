/** "fire" -> "Fire". For data words shown in the UI (runes, rarities). */
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
/** Card search: name ("lc chan" finds "L.C. Chan"), or the exact Star / extra number.
 *  `known: false` (a card the player does not own) matches only by number. */
export function matchesCard(c: { name: string; starNo?: number; extraNo?: number }, query: string, known = true): boolean {
  const q = norm(query);
  if (!q) return true;
  if (/^\d+$/.test(q)) return c.starNo === Number(q) || c.extraNo === Number(q);
  return known && norm(c.name).includes(q);
}
