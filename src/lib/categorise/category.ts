// Maps a row name to one of the app's categories (CATEGORIES in lib/months). Shared by the
// importer and the Convex backfill, so old and new rows land in the same place.
export type AppCategory =
  | 'Home'
  | 'Food'
  | 'Transport'
  | 'Subscriptions'
  | 'Debt'
  | 'Insurance'
  | 'Shopping'
  | 'Fun'
  | 'Other'

// First match wins, so specific names sit above the general words they contain
// ("ica hemförsäkring" is insurance, not groceries; "phonelife (klarna)" is credit).
const KEYWORDS: Array<[AppCategory, string[]]> = [
  [
    'Debt',
    ['klarna', 'resursbank', 'qliro', 'supremecard', 'supreme card', 'anyfin', 'svea', 'csn', 'nordea (bil)', 'nordea bil', 'bil lån', 'billån'],
  ],
  [
    'Insurance',
    ['försäkring', 'hedvig', 'a-kassa', 'akassa', 'saak', 'unionen', 'bliwa', 'euro accident', 'länsförsäkringar', 'trygg-hansa'],
  ],
  [
    'Home',
    [
      'hyra', 'hyran', 'hyresrätt', 'godel', 'ellevio', 'vattenfall', 'fortum', 'energi', 'ownit', 'bredband', 'comhem',
      'com hem', 'fiber', 'elpy', 'flytt', 'bostads',
    ],
  ],
  [
    'Subscriptions',
    [
      'spotify', 'netflix', 'hbo', 'disney', 'youtube', 'viaplay', 'prime', 'icloud', 'linked in', 'linkedin',
      'abonemang', 'abonnemang', 'halebop', 'comviq', 'telenor', 'tele2', 'tele 2', 'hallon', 'vardagspaket',
    ],
  ],
  [
    'Transport',
    ['sl-kort', 'sl enkel', 'resekort', 'väst trafiken', 'västtrafik', 'arlanda express', 'cykel', 'sj ', 'sj(', 'sj nov'],
  ],
  ['Food', ['food', 'ica', 'coop', 'lidl', 'hemköp', 'willys', 'pinchos', 'mcdonald', 'espresso house', 'kuri nuka']],
  [
    'Fun',
    [
      'dummheter', 'nordicwellness', 'nordic wellness', 'sats', 'playstation', 'steam', 'bio', 'grekland', 'barcelona',
      'italia', 'resa', 'sas', 'uppsala', 'fest', 'beyonce',
    ],
  ],
  [
    'Shopping',
    [
      'zalando', 'suitsupply', 'h&m', 'hm.com', 'woodwood', 'calvin klein', 'zara', 'jotex', 'ellos', 'boozt', 'bestofbrands',
      'tradera', 'clas ohlson', 'webhallen', 'kicks', 'iguard', 'once upon', 'stol', 'nelly', 'hudvård', 'apohem',
      'apotea', 'nudient', 'rfsu', 'haircut', 'hair-cut', 'hair cut', 'klipper', 'frisör',
    ],
  ],
]

// Names too short to match safely inside other words.
const EXACT: Record<string, AppCategory> = {
  el: 'Home',
  'el avtal': 'Home',
  mat: 'Food',
  sj: 'Transport',
  hm: 'Shopping',
  prime: 'Subscriptions',
}

export function categoryFor(name: string, bucket?: string): AppCategory {
  // Savings rows ("Savings goal", "Spara till resa") are money kept, not a kind of cost.
  if (bucket === 'savings') return 'Other'
  const n = name.toLowerCase().replace(/\s+/g, ' ').trim()
  if (EXACT[n]) return EXACT[n]
  // Pad so keywords ending in a space ("sj ") also match at the end of a name.
  const padded = `${n} `
  for (const [category, words] of KEYWORDS) {
    if (words.some((w) => padded.includes(w))) return category
  }
  return 'Other'
}
