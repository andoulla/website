import { createGreenTheme } from '@/themes';

import { getPaletteColourMain } from './paletteColourMain.helpers';

describe('getPaletteColourMain', () => {
  const theme = createGreenTheme('light');

  test('returns grey[400] for the "default" colour', () => {
    const result = getPaletteColourMain('default', theme);

    expect(result).toBe(theme.palette.grey[400]);
  });

  test("returns the palette entry's main colour for a named colour", () => {
    const result = getPaletteColourMain('primary', theme);

    expect(result).toBe(theme.palette.primary.main);
  });
});
