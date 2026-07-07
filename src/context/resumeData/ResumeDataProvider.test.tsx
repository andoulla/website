import { act, render } from '@testing-library/react';
import { Component, Suspense } from 'react';
import type { ReactNode } from 'react';

import { TimelineEvent } from '@/testing';
import { loadExperiences } from '@/utils/loadExperiences';

import { ResumeDataProvider, useResumeData } from './ResumeDataProvider';

jest.mock('@/utils/loadExperiences');

const mockLoadExperiences = jest.mocked(loadExperiences);

function ExperiencesConsumer() {
  const experiences = useResumeData();
  return <p>{experiences[0].companyName}</p>;
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

describe('ResumeDataProvider', () => {
  test('exposes the loaded experiences to consumers via the context', async () => {
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = render(
        <ResumeDataProvider
          loader={() =>
            Promise.resolve([new TimelineEvent().companyName('Nimbus Analytics').mock()])
          }
        >
          <Suspense fallback={<p>Loading</p>}>
            <ExperiencesConsumer />
          </Suspense>
        </ResumeDataProvider>
      );
      await Promise.resolve();
    });

    expect(screen.getByText('Nimbus Analytics')).toBeVisible();
  });

  test('shows the fallback while the loader promise is still pending', () => {
    const screen = render(
      <ResumeDataProvider loader={() => new Promise(() => {})}>
        <Suspense fallback={<p>Loading</p>}>
          <ExperiencesConsumer />
        </Suspense>
      </ResumeDataProvider>
    );

    expect(screen.getByText('Loading')).toBeVisible();
  });

  test('surfaces a rejected loader promise to an error boundary', async () => {
    const screen = render(
      <TestErrorBoundary>
        <ResumeDataProvider loader={() => Promise.reject(new Error('failed to load'))}>
          <Suspense fallback={<p>Loading</p>}>
            <ExperiencesConsumer />
          </Suspense>
        </ResumeDataProvider>
      </TestErrorBoundary>
    );

    expect(await screen.findByText('Error: failed to load')).toBeVisible();
  });

  test('uses the default loadExperiences loader when no loader prop is provided', async () => {
    mockLoadExperiences.mockResolvedValue([new TimelineEvent().companyName('Default Co').mock()]);

    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = render(
        <ResumeDataProvider>
          <Suspense fallback={<p>Loading</p>}>
            <ExperiencesConsumer />
          </Suspense>
        </ResumeDataProvider>
      );
      await Promise.resolve();
    });

    expect(screen.getByText('Default Co')).toBeVisible();
    expect(mockLoadExperiences).toHaveBeenCalled();
  });
});
