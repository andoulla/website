import { render } from '@testing-library/react';

import { BulletList } from './BulletList';

describe('BulletList', () => {
  test('renders a list item for each item', () => {
    const screen = render(<BulletList items={['Built APIs', 'Mentored engineers']} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Built APIs');
    expect(items[1]).toHaveTextContent('Mentored engineers');
  });

  test('renders no items for an empty list', () => {
    const screen = render(<BulletList items={[]} />);
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});
