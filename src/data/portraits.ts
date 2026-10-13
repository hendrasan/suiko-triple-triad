// Portrait files live in public/portraits/<file>.webp. Default file name = card id.
// This map lists only the cards whose file name is different.
export const PORTRAIT_FILE: Record<string, string> = {
  hero: 'riou',
  ridley: 'ridley_wizen',
  humphrey: 'humphrey_mintz',
  kiba: 'kiba_windamier',
  sierra: 'sierra_mikain',
  teresa: 'teresa_wisemail',
  georg: 'georg_prime',
  'tai-ho': 'tai_ho',
  'yam-koo': 'yam_koo',
  freed: 'freed_yamamoto',
  yoshino: 'yoshino_yamamoto',
  simone: 'simone_verdricci',
  'lo-wen': 'lo_wen',
  'hai-yo': 'hai_yo',
  kahn: 'kahn_marley',
  'lc-chan': 'long_chan_chan',
  jowy: 'jowy_atreides',
  luca: 'luca_blight',
};

export function portraitUrl(file: string): string {
  return `${import.meta.env.BASE_URL}portraits/${file}.webp`;
}

export function cardPortrait(id: string, override?: string): string {
  return override ?? portraitUrl(PORTRAIT_FILE[id] ?? id);
}
