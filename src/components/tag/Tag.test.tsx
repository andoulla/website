import { render } from '@testing-library/react';

import { Tag } from './Tag';

test('renders children as the tag label', () => {
  const { container } = render(<Tag>React</Tag>);
  expect(container).toHaveTextContent('React');
});
