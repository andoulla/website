import { render } from '@testing-library/react';

import { BulletList } from './BulletList';

test('renders a list item for each item', () => {
  const { container } = render(<BulletList items={['Built APIs', 'Mentored engineers']} />);
  const items = container.querySelectorAll('li');
  expect(items).toHaveLength(2);
  expect(items[0]).toHaveTextContent('Built APIs');
  expect(items[1]).toHaveTextContent('Mentored engineers');
});

test('renders no items for an empty list', () => {
  const { container } = render(<BulletList items={[]} />);
  expect(container.querySelectorAll('li')).toHaveLength(0);
});
