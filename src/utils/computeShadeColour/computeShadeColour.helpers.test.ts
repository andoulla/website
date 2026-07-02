import { computeShadeColour } from './computeShadeColour.helpers';

const mockGetContrastText = jest.fn().mockReturnValue('#ffffff');

// MUI's lighten/darken return "rgb(r, g, b)" strings; sum the channels as a brightness proxy.
const rgbSum = (colour: string) => {
  const channels = colour.match(/\d+/g)?.map(Number) ?? [];
  return channels.reduce((sum, n) => sum + n, 0);
};

describe('computeShadeColour', () => {
  beforeEach(() => mockGetContrastText.mockClear());

  test('returns bg and textColour strings', () => {
    const result = computeShadeColour('#3B6D11', 0, mockGetContrastText);
    expect(typeof result.bg).toBe('string');
    expect(typeof result.textColour).toBe('string');
  });

  test('shade index 1 produces a lighter bg than index 0', () => {
    const base = computeShadeColour('#3B6D11', 0, mockGetContrastText);
    const lighter = computeShadeColour('#3B6D11', 1, mockGetContrastText);
    expect(rgbSum(lighter.bg)).toBeGreaterThan(rgbSum(base.bg));
  });

  test('shade index 4 produces a darker bg than index 0', () => {
    const base = computeShadeColour('#3B6D11', 0, mockGetContrastText);
    const darker = computeShadeColour('#3B6D11', 4, mockGetContrastText);
    expect(rgbSum(darker.bg)).toBeLessThan(rgbSum(base.bg));
  });

  test('shade index 6 wraps to the same bg as index 0', () => {
    const a = computeShadeColour('#3B6D11', 0, mockGetContrastText);
    const b = computeShadeColour('#3B6D11', 6, mockGetContrastText);
    expect(a.bg).toBe(b.bg);
  });

  test('passes the computed bg to getContrastText', () => {
    computeShadeColour('#3B6D11', 1, mockGetContrastText);
    expect(mockGetContrastText).toHaveBeenCalledTimes(1);
    expect(typeof mockGetContrastText.mock.calls[0][0]).toBe('string');
  });

  test('always returns the same result for the same inputs', () => {
    const a = computeShadeColour('#A300A3', 3, mockGetContrastText);
    const b = computeShadeColour('#A300A3', 3, mockGetContrastText);
    expect(a.bg).toBe(b.bg);
  });
});
