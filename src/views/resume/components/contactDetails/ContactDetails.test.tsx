import { render } from '@testing-library/react';

import { ContactDetails } from './ContactDetails';

describe('ContactDetails', () => {
  test('renders email, LinkedIn, and GitHub contact links', () => {
    const screen = render(<ContactDetails />);

    const emailLink = screen.getByRole('link', { name: 'mariandi.stylianou@example.com' });
    expect(emailLink).toBeVisible();
    expect(emailLink).toHaveAttribute('href', 'mailto:mariandi.stylianou@example.com');

    const linkedInLink = screen.getByRole('link', { name: 'LinkedIn' });
    expect(linkedInLink).toBeVisible();
    expect(linkedInLink).toHaveAttribute('target', '_blank');
    expect(linkedInLink).toHaveAttribute('rel', 'noopener noreferrer');

    const githubLink = screen.getByRole('link', { name: 'GitHub' });
    expect(githubLink).toBeVisible();
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
