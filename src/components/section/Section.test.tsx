import { render } from '@testing-library/react';

import { Section } from './Section';

test('renders the title as an h2 by default', () => {
  const { container } = render(
    <Section title="Responsibilities">
      <p>Content</p>
    </Section>
  );
  const heading = container.querySelector('h2');
  expect(heading).toHaveTextContent('Responsibilities');
  expect(container).toHaveTextContent('Content');
});

test('renders the title at the requested heading level', () => {
  const { container } = render(
    <Section title="Key Skills" titleLevel={3}>
      <p>Content</p>
    </Section>
  );
  expect(container.querySelector('h3')).toHaveTextContent('Key Skills');
});
