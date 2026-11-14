export type CategoryRule = {
  bucket: 'needs' | 'wants' | 'savings'
  savingsSlug?: 'investment' | 'travel' | 'emergency'
  category: string
  keywords: string[]
  // Whole-name matches, for words too short to match safely inside other names.
  exact?: string[]
  // Wins over the column a sheet put the row in.
  force?: boolean
}

export const RULES: CategoryRule[] = [
  // Savings means money into the investment account only. Consumer credit paid
  // clothes, electronics and travel, so it is a want even where a sheet filed it
  // under "Savings / Loans". Student and car loans are fixed obligations.
  {
    bucket: 'wants',
    category: 'credit',
    force: true,
    keywords: ['klarna', 'resursbank', 'qliro', 'supremecard', 'supreme card', 'anyfin'],
  },
  {
    bucket: 'needs',
    category: 'loans',
    force: true,
    keywords: ['csn', 'bil lån', 'billån', 'nordea (bil)', 'nordea bil'],
  },
  { bucket: 'needs', category: 'insurance', keywords: ['hemförsäkring', 'hedvig'] },
  { bucket: 'needs', category: 'phone', keywords: ['abonemang', 'abonnemang'] },
  { bucket: 'needs', category: 'utilities', keywords: ['ownit', 'comhem', 'com hem', 'godel', 'elpy'], exact: ['el', 'el avtal'] },
  { bucket: 'needs', category: 'groceries', keywords: [], exact: ['mat'] },
  { bucket: 'needs', category: 'unemployment insurance', keywords: ['a-kassa', 'akassa', 'saak', 'unionen'] },
  { bucket: 'wants', category: 'fun money', keywords: ['dummheter'] },
  { bucket: 'wants', category: 'gym', keywords: ['nordicwellness', 'nordic wellness', 'sats'] },
  { bucket: 'wants', category: 'haircut', keywords: ['hair-cut', 'haircut', 'hair cut', 'frisör'] },
  { bucket: 'needs', category: 'rent', keywords: ['hyra', 'hyresrätt'] },
  {
    bucket: 'needs',
    category: 'utilities',
    keywords: ['vattenfall', 'ellevio', 'fortum', 'fiber', 'bredband', 'el '],
  },
  {
    bucket: 'needs',
    category: 'groceries',
    keywords: ['ica', 'coop', 'lidl', 'hemköp', 'willys'],
  },
  {
    bucket: 'needs',
    category: 'transit',
    keywords: ['sl ', 'vt ', 'resekort', 'sj ab', 'sl-kort'],
  },
  {
    bucket: 'needs',
    category: 'insurance',
    keywords: ['länsförsäkringar', 'if försäkring', 'trygg-hansa'],
  },
  {
    bucket: 'needs',
    category: 'phone',
    keywords: ['telenor', 'tele2', 'tre ab', 'hallon'],
  },
  {
    bucket: 'wants',
    category: 'restaurants',
    keywords: ['pinchos', 'max ', 'mcdonald', 'espresso house'],
  },
  {
    bucket: 'wants',
    category: 'streaming',
    keywords: ['netflix', 'spotify', 'youtube premium', 'hbo', 'disney'],
  },
  {
    bucket: 'wants',
    category: 'shopping',
    keywords: ['zalando', 'hm.com', 'nelly', 'cos '],
  },
  { bucket: 'wants', category: 'hobby', keywords: ['steam', 'playstation'] },
  {
    bucket: 'savings',
    savingsSlug: 'investment',
    category: 'investment',
    keywords: ['avanza', 'nordnet', 'pensionsmyndigheten', 'index', 'etf'],
  },
  {
    bucket: 'savings',
    savingsSlug: 'travel',
    category: 'travel',
    keywords: ['travel fund', 'resor sparkonto', 'semester'],
  },
  {
    bucket: 'savings',
    savingsSlug: 'emergency',
    category: 'emergency',
    keywords: ['buffert', 'emergency', 'sparande säkerhet'],
  },
]
