import { render, screen } from '@testing-library/react';

import { Resume } from './Resume';

test('renders the page heading and every job from the dummy data', () => {
  render(<Resume />);

  expect(screen.getByRole('heading', { name: 'Mariandi Stylianou' })).toBeInTheDocument();
  expect(screen.getByText('Nimbus Analytics')).toBeInTheDocument();
  expect(screen.getByText('Brightleaf Software')).toBeInTheDocument();
  expect(screen.getByText('Harborview Digital')).toBeInTheDocument();
});
