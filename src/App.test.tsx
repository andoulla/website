import { render } from '@testing-library/react';

import App from './App';

test('renders the resume on the home route', () => {
  const { container } = render(<App />);
  const heading = container.querySelector('h1');

  expect(heading).toBeInTheDocument();
  expect(heading).toHaveTextContent('Mariandi Stylianou');
});
