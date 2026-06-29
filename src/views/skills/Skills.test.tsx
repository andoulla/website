import { render } from '@testing-library/react';

import { Skills } from './Skills';

describe('Skills', () => {
  test('renders the page heading and empty-state message', () => {
    const screen = render(<Skills />);

    expect(screen.getByRole('heading', { level: 1, name: 'Skills' })).toBeVisible();
    expect(screen.getByText('No skills added yet.')).toBeVisible();
  });
});
