import { render, screen } from '@testing-library/react';

import { Tag } from './Tag';

describe('Tag', () => {
  test('renders children as the tag label', () => {
    render(<Tag>React</Tag>);
    expect(screen.getByText('React')).toBeVisible();
  });
});
