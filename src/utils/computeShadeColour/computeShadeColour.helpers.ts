import { darken, lighten } from '@mui/material/styles';

import type { ShadeColourResult } from './computeShadeColour.types';

// Six adjustments spread around the palette main colour:
// indices 0–3 progressively lighten, indices 4–5 darken.
const SHADE_ADJUSTMENTS = [0, 0.18, 0.34, 0.5, -0.12, -0.24] as const;

/**
 * Computes an opaque background shade and a contrasting text colour for a given
 * palette `main` hex value and a 0-based shade index.
 *
 * @param getContrastText - theme.palette.getContrastText, injected so the
 *   function stays pure and testable without a full MUI theme.
 */
export const computeShadeColour = (
  main: string,
  shadeIndex: number,
  getContrastText: (colour: string) => string
): ShadeColourResult => {
  const len = SHADE_ADJUSTMENTS.length;
  // JS `%` preserves sign, so normalise a negative index into the positive range.
  const adjustment = SHADE_ADJUSTMENTS[((shadeIndex % len) + len) % len];
  const bg = adjustment >= 0 ? lighten(main, adjustment) : darken(main, -adjustment);

  return { bg, textColour: getContrastText(bg) };
};
