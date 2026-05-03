// ==================== THEME SYSTEM ====================
// Age of Empires II Medieval Theme

export interface ThemeColors {
  gold: string
  goldLight: string
  goldDark: string
  bronze: string
  bgDark: string
  bgPanel: string
  bgCard: string
  textCream: string
  textMuted: string
  borderGold: string
}

export const medievalTheme: ThemeColors = {
  gold: '#c8a84b',
  goldLight: '#e8c76a',
  goldDark: '#8a6f2e',
  bronze: '#7a4a1a',
  bgDark: '#0d0800',
  bgPanel: '#1a1000',
  bgCard: '#221500',
  textCream: '#f5e6c8',
  textMuted: '#a89060',
  borderGold: 'rgba(200, 168, 75, 0.4)',
}

export const theme = medievalTheme

// Tetris piece colors using theme
export const tetrisColors = {
  empty: 'transparent',
  I: '#e8c76a', // Cyan - gold light
  O: '#c8a84b', // Yellow - gold
  T: '#d4af37', // Purple - gold bright
  S: '#8a6f2e', // Green - gold dark
  Z: '#7a4a1a', // Red - bronze
  J: '#f5e6c8', // Blue - cream
  L: '#a89060', // Orange - text muted
  shadow: 'rgba(200, 168, 75, 0.2)',
}
