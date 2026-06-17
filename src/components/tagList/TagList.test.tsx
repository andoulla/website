import { render } from '@testing-library/react';

import { TagList } from './TagList';

test('renders a tag for each item', () => {
  const { container } = render(<TagList items={['React', 'TypeScript']} />);
  const items = container.querySelectorAll('li');
  expect(items).toHaveLength(2);
  expect(items[0]).toHaveTextContent('React');
  expect(items[1]).toHaveTextContent('TypeScript');
});

test('renders no tags for an empty list', () => {
  const { container } = render(<TagList items={[]} />);
  expect(container.querySelectorAll('li')).toHaveLength(0);
});
