import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { ErrorBoundary } from './ErrorBoundary';

const ThrowingChild = () => {
  throw new Error('boom');
};

describe('ErrorBoundary', () => {
  test('renders children when there is no error', async () => {
    const screen = render(
      <ErrorBoundary fallback={(error) => <p>Error: {error.message}</p>}>
        <p>All good</p>
      </ErrorBoundary>
    );

    expect(screen.getByText('All good')).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('renders the fallback and logs the caught error after a child throws', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const screen = render(
      <ErrorBoundary fallback={(error) => <p>Error: {error.message}</p>}>
        <ThrowingChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error: boom')).toBeVisible();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.objectContaining({ message: 'boom' }),
      expect.any(String)
    );
    expect(await axe(screen.container)).toHaveNoViolations();

    consoleErrorSpy.mockRestore();
  });
});
