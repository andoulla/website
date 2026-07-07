import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

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

  test('has no axe violations with tags', async () => {
    const screen = render(<TagList items={['React', 'TypeScript']} />);

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no axe violations with an empty list', async () => {
    const screen = render(<TagList items={[]} />);

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('calls onItemClick with the item name when a tag is clicked', async () => {
    const user = userEvent.setup();
    const onItemClick = jest.fn();
    const screen = render(<TagList items={['React', 'TypeScript']} onItemClick={onItemClick} />);

    await user.click(screen.getByText('React'));
    expect(onItemClick).toHaveBeenCalledWith('React');
    expect(onItemClick).toHaveBeenCalledTimes(1);
  });

  test('does not throw when a tag is clicked without an onItemClick handler', async () => {
    const user = userEvent.setup();
    const screen = render(<TagList items={['React']} />);

    await user.click(screen.getByText('React'));

    expect(screen.getByText('React')).toBeVisible();
  });
});
