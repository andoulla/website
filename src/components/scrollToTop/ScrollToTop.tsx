import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Plain BrowserRouter keeps the scroll offset across navigations. Keyed on pathname only —
// search param changes (?track= tabs, skills filters) must not scroll.
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
