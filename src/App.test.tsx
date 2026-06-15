import { render } from '@testing-library/react';

import App from './App';

test('renders hello mariandi', () => {
  const { container } = render(<App />);
  const heading = container.querySelector('h1');

  expect(heading).toBeInTheDocument();
  expect(heading).toHaveTextContent(/hello mariandi/i);
});
