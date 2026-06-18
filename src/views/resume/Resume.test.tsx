import { render, screen } from '@testing-library/react';

import { Resume } from './Resume';

describe('Resume', () => {
  test('renders the page heading and every job from the dummy data', () => {
    render(<Resume />);

    expect(screen.getByRole('heading', { name: 'Mariandi Stylianou' })).toBeVisible();
    expect(screen.getByText('Nimbus Analytics')).toBeVisible();
    expect(screen.getByText('Brightleaf Software')).toBeVisible();
    expect(screen.getByText('Harborview Digital')).toBeVisible();
  });
});
