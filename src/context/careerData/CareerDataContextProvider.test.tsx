import { act, render } from '@testing-library/react';
import { Component, Suspense } from 'react';
import type { ReactNode } from 'react';

import { TimelineEvent } from '@/testing';
import { loadCareerHistory } from '@/utils/loadCareerHistory';

import { CareerDataContextProvider, useCareerDataContext } from './CareerDataContextProvider';

jest.mock('@/utils/loadCareerHistory');

const mockLoadCareerHistory = jest.mocked(loadCareerHistory);

function CareerHistoryConsumer() {
  const [firstEvent] = useCareerDataContext();
  return <p>{firstEvent.companyName}</p>;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class TestErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  render() {
    if (this.state.error !== null) {
      return <p>Error: {this.state.error.message}</p>;
    }
    return this.props.children;
  }
}

describe('CareerDataContextProvider', () => {
  test('exposes the loaded career history to consumers via the context', async () => {
    const screen = await act(async () => {
      const result = render(
        <CareerDataContextProvider
          loader={() =>
            Promise.resolve([new TimelineEvent().companyName('Meridian Dynamics').mock()])
          }
        >
          <Suspense fallback={<p>Loading</p>}>
            <CareerHistoryConsumer />
          </Suspense>
        </CareerDataContextProvider>
      );

      await Promise.resolve();

      return result;
    });

    expect(screen.getByText('Meridian Dynamics')).toBeVisible();
  });

  test('shows the fallback while the loader promise is still pending', () => {
    const screen = render(
      <CareerDataContextProvider loader={() => new Promise(() => {})}>
        <Suspense fallback={<p>Loading</p>}>
          <CareerHistoryConsumer />
        </Suspense>
      </CareerDataContextProvider>
    );

    expect(screen.getByText('Loading')).toBeVisible();
  });

  test('surfaces a rejected loader promise to an error boundary', async () => {
    const screen = render(
      <TestErrorBoundary>
        <CareerDataContextProvider loader={() => Promise.reject(new Error('failed to load'))}>
          <Suspense fallback={<p>Loading</p>}>
            <CareerHistoryConsumer />
          </Suspense>
        </CareerDataContextProvider>
      </TestErrorBoundary>
    );

    expect(await screen.findByText('Error: failed to load')).toBeVisible();
  });

  test('uses the default loadCareerHistory loader when no loader prop is provided', async () => {
    mockLoadCareerHistory.mockResolvedValue([new TimelineEvent().companyName('Default Co').mock()]);

    const screen = await act(async () => {
      const result = render(
        <CareerDataContextProvider>
          <Suspense fallback={<p>Loading</p>}>
            <CareerHistoryConsumer />
          </Suspense>
        </CareerDataContextProvider>
      );

      await Promise.resolve();

      return result;
    });

    expect(screen.getByText('Default Co')).toBeVisible();
    expect(mockLoadCareerHistory).toHaveBeenCalled();
  });
});
