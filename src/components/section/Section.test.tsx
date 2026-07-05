import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { Section } from './Section';

describe('Section', () => {
  test('renders the title as an h2 by default', () => {
    const screen = render(
      <Section title="Responsibilities">
        <p>Content</p>
      </Section>
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Responsibilities' })).toBeVisible();
    expect(screen.getByText('Content')).toBeVisible();
  });

  test('renders the title at the requested heading level', () => {
    const screen = render(
      <Section title="Key Skills" titleLevel={3}>
        <p>Content</p>
      </Section>
    );

    expect(screen.getByRole('heading', { level: 3, name: 'Key Skills' })).toBeVisible();
  });

  test('renders the title as an h4 at the deepest level', () => {
    const screen = render(
      <Section title="References" titleLevel={4}>
        <p>Content</p>
      </Section>
    );

    expect(screen.getByRole('heading', { level: 4, name: 'References' })).toBeVisible();
  });

  test('has no axe violations with default heading level', async () => {
    const screen = render(
      <Section title="Responsibilities">
        <p>Content</p>
      </Section>
    );

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no axe violations with h3 heading level', async () => {
    const screen = render(
      <Section title="Key Skills" titleLevel={3}>
        <p>Content</p>
      </Section>
    );

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no axe violations with h4 heading level', async () => {
    const screen = render(
      <Section title="References" titleLevel={4}>
        <p>Content</p>
      </Section>
    );

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
