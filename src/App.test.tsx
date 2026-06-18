import { render, screen } from '@testing-library/react';

import App from './App';

describe('App', () => {
  test('renders the resume on the home route', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Mariandi Stylianou' })).toBeVisible();
  });
});
