// ─── Project Arise · Design Tokens ──────────────────────────────────────────
// Both light and dark palettes share the same shape (Colors type).
// Components use useTheme() to get the active palette.

export interface Colors {
  // Backgrounds
  void:     string;
  surface:  string;
  surface2: string;
  surface3: string;
  // Accent
  blue:       string;
  cyan:       string;
  violet:     string;
  blueDim:    string;
  blueBorder: string;
  blueGlow:   string;
  cyanDim:    string;
  cyanBorder: string;
  // Borders
  border:      string;
  borderMid:   string;
  borderFocus: string;
  // Stat colors
  statInt: string;
  statPer: string;
  statStr: string;
  statVit: string;
  // Bars
  hp: string; hpDark: string;
  mp: string; mpDark: string;
  xp: string; xpDark: string;
  // Rank
  rankE: string; rankD: string; rankC: string;
  rankB: string; rankA: string; rankS: string;
  // Rarity
  common: string; rare: string; epic: string; legendary: string;
  // Feedback
  success: string; warning: string; penalty: string; gold: string;
  // Typography
  text:    string;
  textSub: string;
  textMut: string;
  textFnt: string;
  // Habit categories
  habitHealth: string;
  habitMind:   string;
  habitWork:   string;
  habitSocial: string;
}

export type ProtocolMode = 'MONARCH' | 'FINANCE';

// ─── Light ────────────────────────────────────────────────────────────────────
export const LIGHT: Colors = {
  void:     '#FAFAF9',
  surface:  '#FFFFFF',
  surface2: '#F4F4F2',
  surface3: '#EDEDE9',

  blue:       '#4F46E5',
  cyan:       '#0891B2',
  violet:     '#7C3AED',
  blueDim:    'rgba(79, 70, 229, 0.07)',
  blueBorder: 'rgba(79, 70, 229, 0.20)',
  blueGlow:   'rgba(79, 70, 229, 0.15)',
  cyanDim:    'rgba(8, 145, 178, 0.08)',
  cyanBorder: 'rgba(8, 145, 178, 0.20)',

  border:      'rgba(0, 0, 0, 0.07)',
  borderMid:   'rgba(0, 0, 0, 0.13)',
  borderFocus: 'rgba(79, 70, 229, 0.45)',

  statInt: '#4F46E5',
  statPer: '#0891B2',
  statStr: '#DC2626',
  statVit: '#D97706',

  hp: '#EF4444', hpDark: 'rgba(239,68,68,0.12)',
  mp: '#4F46E5', mpDark: 'rgba(79,70,229,0.10)',
  xp: '#0891B2', xpDark: 'rgba(8,145,178,0.10)',

  rankE: '#94A3B8', rankD: '#10B981', rankC: '#0891B2',
  rankB: '#4F46E5', rankA: '#7C3AED', rankS: '#D97706',

  common: '#64748B', rare: '#0891B2', epic: '#7C3AED', legendary: '#D97706',

  success: '#10B981', warning: '#F59E0B', penalty: '#EF4444', gold: '#D97706',

  text:    '#111827',
  textSub: 'rgba(17, 24, 39, 0.60)',
  textMut: 'rgba(17, 24, 39, 0.38)',
  textFnt: 'rgba(17, 24, 39, 0.16)',

  habitHealth: '#10B981',
  habitMind:   '#4F46E5',
  habitWork:   '#D97706',
  habitSocial: '#EC4899',
};

// ─── Dark ─────────────────────────────────────────────────────────────────────
export const DARK: Colors = {
  void:     '#0C0D12',
  surface:  '#14151A',
  surface2: '#1C1D24',
  surface3: '#242530',

  blue:       '#6366F1',
  cyan:       '#22D3EE',
  violet:     '#A78BFA',
  blueDim:    'rgba(99, 102, 241, 0.12)',
  blueBorder: 'rgba(99, 102, 241, 0.28)',
  blueGlow:   'rgba(99, 102, 241, 0.40)',
  cyanDim:    'rgba(34, 211, 238, 0.10)',
  cyanBorder: 'rgba(34, 211, 238, 0.25)',

  border:      'rgba(255, 255, 255, 0.07)',
  borderMid:   'rgba(255, 255, 255, 0.13)',
  borderFocus: 'rgba(99, 102, 241, 0.55)',

  statInt: '#818CF8',
  statPer: '#22D3EE',
  statStr: '#F87171',
  statVit: '#FBBF24',

  hp: '#F87171', hpDark: 'rgba(248,113,113,0.15)',
  mp: '#818CF8', mpDark: 'rgba(129,140,248,0.15)',
  xp: '#22D3EE', xpDark: 'rgba(34,211,238,0.12)',

  rankE: '#64748B', rankD: '#34D399', rankC: '#22D3EE',
  rankB: '#818CF8', rankA: '#A78BFA', rankS: '#FBBF24',

  common: '#94A3B8', rare: '#22D3EE', epic: '#A78BFA', legendary: '#FBBF24',

  success: '#34D399', warning: '#FBBF24', penalty: '#F87171', gold: '#FBBF24',

  text:    '#ECEDF5',
  textSub: 'rgba(236, 237, 245, 0.62)',
  textMut: 'rgba(236, 237, 245, 0.38)',
  textFnt: 'rgba(236, 237, 245, 0.14)',

  habitHealth: '#34D399',
  habitMind:   '#818CF8',
  habitWork:   '#FBBF24',
  habitSocial: '#F472B6',
};

// ─── Legacy (kept for any direct imports still in flight) ────────────────────
export const C = LIGHT;

export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export const RANK_COLOR_LIGHT: Record<string, string> = {
  E: LIGHT.rankE, D: LIGHT.rankD, C: LIGHT.rankC,
  B: LIGHT.rankB, A: LIGHT.rankA, S: LIGHT.rankS,
};
export const RANK_COLOR_DARK: Record<string, string> = {
  E: DARK.rankE, D: DARK.rankD, C: DARK.rankC,
  B: DARK.rankB, A: DARK.rankA, S: DARK.rankS,
};
export const RANK_COLOR = RANK_COLOR_LIGHT; // legacy alias

export const RARITY_COLOR_LIGHT: Record<Rarity, string> = {
  Common: LIGHT.common, Rare: LIGHT.rare, Epic: LIGHT.epic, Legendary: LIGHT.legendary,
};
export const RARITY_COLOR_DARK: Record<Rarity, string> = {
  Common: DARK.common, Rare: DARK.rare, Epic: DARK.epic, Legendary: DARK.legendary,
};
export const RARITY_COLOR = RARITY_COLOR_LIGHT; // legacy default

export const FINANCE_ACCENT_LIGHT = '#10B981';
export const FINANCE_ACCENT_DARK = '#34D399';

export function protocolAccent(protocol: ProtocolMode, isDark: boolean, fallbackBlue: string) {
  if (protocol === 'FINANCE') return isDark ? FINANCE_ACCENT_DARK : FINANCE_ACCENT_LIGHT;
  return fallbackBlue;
}
