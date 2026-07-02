import { darken, lighten } from '@mui/material/styles';

// Six adjustments spread around the palette main color:
// indices 0–3 progressively lighten, indices 4–5 darken.
const SHADE_ADJUSTMENTS = [0, 0.18, 0.34, 0.5, -0.12, -0.24] as const;

export interface ShadeColorResult {
  bg: string;
  textColor: string;
}

/**
 * Computes an opaque background shade and a contrasting text color for a given
 * palette `main` hex value and a 0-based shade index.
 *
 * @param getContrastText - theme.palette.getContrastText, injected so the
 *   function stays pure and testable without a full MUI theme.
 */
export function computeShadeColor(
  main: string,
  shadeIndex: number,
  getContrastText: (color: string) => string
): ShadeColorResult {
  const adj = SHADE_ADJUSTMENTS[shadeIndex % SHADE_ADJUSTMENTS.length];
  const bg = adj >= 0 ? lighten(main, adj) : darken(main, -adj);
  return { bg, textColor: getContrastText(bg) };
}
