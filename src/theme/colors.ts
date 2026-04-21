// ─── Project Arise · Monarch Design Tokens v3 ──────────────────────────────
// Modern slate-dark palette — lighter, visible surface layers, vibrant accents.
// Inspired by Linear.app dark mode + Solo Leveling System UI.

export const C = {
  // ── Backgrounds (readable slate-dark, not cave black) ──
  void:     '#0C0E1A',   // Slate-black with faint indigo undertone
  surface:  '#141824',   // Card / panel layer
  surface2: '#1C2236',   // Elevated / input layer
  surface3: '#222840',   // Hover / pressed state

  // ── Primary accent — System Indigo ──
  blue:       '#7C83FD',                   // Vivid indigo-violet
  cyan:       '#38BDF8',                   // Sky-cyan for XP / progress
  violet:     '#A78BFA',                   // Soft violet — secondary
  blueDim:    'rgba(124, 131, 253, 0.10)',
  blueBorder: 'rgba(124, 131, 253, 0.22)',
  blueGlow:   'rgba(124, 131, 253, 0.42)',
  cyanDim:    'rgba(56, 189, 248, 0.10)',
  cyanBorder: 'rgba(56, 189, 248, 0.25)',

  // ── Borders ──
  border:     'rgba(255, 255, 255, 0.07)',
  borderMid:  'rgba(255, 255, 255, 0.11)',
  borderFocus:'rgba(124, 131, 253, 0.55)',

  // ── Per-stat accent colors ──
  statInt: '#7C83FD',   // Vivid indigo
  statPer: '#38BDF8',   // Sky cyan
  statStr: '#FB7185',   // Rose
  statVit: '#FB923C',   // Amber

  // ── HP / MP / XP bars ──
  hp:     '#FB7185',
  hpDark: 'rgba(251,113,133,0.15)',
  mp:     '#7C83FD',
  mpDark: 'rgba(124,131,253,0.15)',
  xp:     '#38BDF8',
  xpDark: 'rgba(56,189,248,0.12)',

  // ── Rank badge colors ──
  rankE: '#64748B',
  rankD: '#34D399',
  rankC: '#38BDF8',
  rankB: '#7C83FD',
  rankA: '#A78BFA',
  rankS: '#FBBF24',

  // ── Rarity ──
  common:    '#94A3B8',
  rare:      '#38BDF8',
  epic:      '#A78BFA',
  legendary: '#FBBF24',

  // ── Feedback ──
  success: '#34D399',
  warning: '#FB923C',
  penalty: '#FB7185',
  gold:    '#FBBF24',

  // ── Typography ──
  text:    '#EFF2FF',                    // Slightly cool white
  textSub: 'rgba(239, 242, 255, 0.60)',
  textMut: 'rgba(239, 242, 255, 0.35)',
  textFnt: 'rgba(239, 242, 255, 0.12)',
} as const;

export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export const RANK_COLOR: Record<string, string> = {
  E: C.rankE, D: C.rankD, C: C.rankC,
  B: C.rankB, A: C.rankA, S: C.rankS,
};

export const RARITY_COLOR: Record<Rarity, string> = {
  Common: C.common, Rare: C.rare, Epic: C.epic, Legendary: C.legendary,
};
