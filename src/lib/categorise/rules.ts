export type CategoryRule = {
  bucket: 'needs' | 'wants' | 'savings'
  savingsSlug?: 'investment' | 'travel' | 'emergency'
  category: string
  keywords: string[]
}

export const RULES: CategoryRule[] = [
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
