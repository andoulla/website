export const baseTokens = {
  typography: { fontFamily: 'system-ui, sans-serif' },
} as const;

export const lightTokens = {
  background: { default: '#f8fafc', paper: '#ffffff' },
  text: { primary: '#0f172a', disabled: '#AFA5AF' },
} as const;

export const darkTokens = {
  background: { default: '#0f1117', paper: '#1a1d24' },
  text: { primary: '#f1f5f9', disabled: '#64748b' },
} as const;
