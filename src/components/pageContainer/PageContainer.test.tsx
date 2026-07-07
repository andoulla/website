import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { PageContainer } from './PageContainer';

describe('PageContainer', () => {
  test('renders its children', () => {
    const screen = render(
      <PageContainer>
        <p>Content</p>
      </PageContainer>
    );

    expect(screen.getByText('Content')).toBeVisible();
  });

  test('has no axe violations', async () => {
    const screen = render(
      <PageContainer>
        <p>Content</p>
      </PageContainer>
    );

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
