import {
  prefersDarkColourScheme,
  readStoredDarkMode,
  readStoredThemeName,
  storeDarkMode,
  storeThemeName,
} from './ThemeContextProvider.helpers';

describe('ThemeContextProvider helpers', () => {
  describe('readStoredThemeName', () => {
    test('returns undefined when nothing is stored', () => {
      expect(readStoredThemeName()).toBeUndefined();
    });

    test('round-trips a stored theme name', () => {
      storeThemeName('green');

      expect(readStoredThemeName()).toBe('green');
    });

    test('ignores an invalid stored value', () => {
      window.localStorage.setItem('theme-name', 'blue');

      expect(readStoredThemeName()).toBeUndefined();
    });

    test('returns undefined when storage throws', () => {
      const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('storage unavailable');
      });

      expect(readStoredThemeName()).toBeUndefined();

      getItem.mockRestore();
    });
  });

  describe('storeThemeName', () => {
    test('does not throw when storage throws', () => {
      const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('storage unavailable');
      });

      expect(() => storeThemeName('purple')).not.toThrow();

      setItem.mockRestore();
    });
  });

  describe('readStoredDarkMode', () => {
    test('returns undefined when nothing is stored', () => {
      expect(readStoredDarkMode()).toBeUndefined();
    });

    test('round-trips stored true and false', () => {
      storeDarkMode(true);

      expect(readStoredDarkMode()).toBe(true);

      storeDarkMode(false);

      expect(readStoredDarkMode()).toBe(false);
    });

    test('ignores an invalid stored value', () => {
      window.localStorage.setItem('dark-mode', 'maybe');

      expect(readStoredDarkMode()).toBeUndefined();
    });
  });

  describe('prefersDarkColourScheme', () => {
    test('reflects the media query result', () => {
      expect(prefersDarkColourScheme()).toBe(false);
    });
  });
});
