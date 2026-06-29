import { render } from '@testing-library/react';

import { Tag } from './Tag';

describe('Tag', () => {
  test('renders children as the tag label', () => {
    const screen = render(<Tag>React</Tag>);
    expect(screen.getByText('React')).toBeVisible();
  });
});
