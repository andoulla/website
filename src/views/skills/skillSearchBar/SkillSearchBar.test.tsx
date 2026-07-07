import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import { SkillSearchBar } from './SkillSearchBar';

describe('SkillSearchBar', () => {
  test('renders a text input with an accessible name', () => {
    const screen = render(<SkillSearchBar value="" onChange={jest.fn()} />);

    expect(screen.getByRole('textbox', { name: 'Search skills by name' })).toBeVisible();
  });

  test('calls onChange with the typed value', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const screen = render(<SkillSearchBar value="" onChange={onChange} />);

    await user.type(screen.getByRole('textbox', { name: 'Search skills by name' }), 'r');

    expect(onChange).toHaveBeenCalledWith('r');
  });

  test('does not render a clear button when the value is empty', () => {
    const screen = render(<SkillSearchBar value="" onChange={jest.fn()} />);

    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  });

  test('renders a clear button when the value is non-empty', () => {
    const screen = render(<SkillSearchBar value="react" onChange={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Clear search' })).toBeVisible();
  });

  test('calls onChange with an empty string when the clear button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const screen = render(<SkillSearchBar value="react" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(onChange).toHaveBeenCalledWith('');
  });

  test('calls onChange with an empty string when Escape is pressed on a non-empty value', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const screen = render(<SkillSearchBar value="react" onChange={onChange} />);

    screen.getByRole('textbox', { name: 'Search skills by name' }).focus();
    await user.keyboard('{Escape}');

    expect(onChange).toHaveBeenCalledWith('');
  });

  test('does not call onChange on Escape when the value is already empty', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const screen = render(<SkillSearchBar value="" onChange={onChange} />);

    screen.getByRole('textbox', { name: 'Search skills by name' }).focus();
    await user.keyboard('{Escape}');

    expect(onChange).not.toHaveBeenCalled();
  });

  test('renders the hint text when provided', () => {
    const screen = render(
      <SkillSearchBar value="react" onChange={jest.fn()} hint="1 match hidden by filters" />
    );

    expect(screen.getByText('1 match hidden by filters')).toBeVisible();
  });

  test('has no axe violations when empty', async () => {
    const screen = render(<SkillSearchBar value="" onChange={jest.fn()} />);

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no axe violations with a value, clear button, and hint', async () => {
    const screen = render(
      <SkillSearchBar value="react" onChange={jest.fn()} hint="1 match hidden by filters" />
    );

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
