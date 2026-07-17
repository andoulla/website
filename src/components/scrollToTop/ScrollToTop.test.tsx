import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter } from 'react-router-dom';

import { ScrollToTop } from './ScrollToTop';

const renderWithRouter = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <ScrollToTop />
      <Link to="/skills">to skills</Link>
      <Link to="/?track=lead">to home with track</Link>
    </MemoryRouter>
  );

describe('ScrollToTop', () => {
  test('scrolls to the top when the pathname changes', async () => {
    const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const user = userEvent.setup();
    const screen = renderWithRouter();

    scrollToSpy.mockClear();
    await user.click(screen.getByRole('link', { name: 'to skills' }));

    expect(scrollToSpy).toHaveBeenCalledWith(0, 0);

    scrollToSpy.mockRestore();
  });

  test('does not scroll when only the search params change', async () => {
    const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const user = userEvent.setup();
    const screen = renderWithRouter();

    scrollToSpy.mockClear();
    await user.click(screen.getByRole('link', { name: 'to home with track' }));

    expect(scrollToSpy).not.toHaveBeenCalled();

    scrollToSpy.mockRestore();
  });
});
