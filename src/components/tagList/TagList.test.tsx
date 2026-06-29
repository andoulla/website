import { render } from '@testing-library/react';

import { TagList } from './TagList';

describe('TagList', () => {
  test('renders a tag for each item', () => {
    const screen = render(<TagList items={['React', 'TypeScript']} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('React');
    expect(items[1]).toHaveTextContent('TypeScript');
  });

  test('renders no tags for an empty list', () => {
    const screen = render(<TagList items={[]} />);
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});
