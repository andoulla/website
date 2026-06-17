import { render, screen } from '@testing-library/react';

import { Section } from './Section';

test('renders the title as an h2 by default', () => {
  render(
    <Section title="Responsibilities">
      <p>Content</p>
    </Section>
  );
  expect(screen.getByRole('heading', { level: 2, name: 'Responsibilities' })).toBeVisible();
  expect(screen.getByText('Content')).toBeVisible();
});

test('renders the title at the requested heading level', () => {
  render(
    <Section title="Key Skills" titleLevel={3}>
      <p>Content</p>
    </Section>
  );
  expect(screen.getByRole('heading', { level: 3, name: 'Key Skills' })).toBeVisible();
});
