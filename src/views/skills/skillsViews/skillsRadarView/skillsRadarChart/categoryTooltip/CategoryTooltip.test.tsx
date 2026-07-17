import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import type { TooltipContentProps } from 'recharts';

import type { CategoryRadarPoint } from '../SkillsRadarChart.types';

import { CategoryTooltip } from './CategoryTooltip';

const frontendPoint: CategoryRadarPoint = {
  categoryId: 'frontend-development',
  categoryIndex: 0,
  label: 'Frontend Development',
  avgYears: 2.5,
  skillCount: 3,
  isMatch: true,
};

const renderTooltip = (active: boolean, payload: TooltipContentProps['payload']) =>
  render(
    <CategoryTooltip
      active={active}
      payload={payload}
      coordinate={undefined}
      accessibilityLayer={false}
      activeIndex={undefined}
    />
  );

describe('CategoryTooltip', () => {
  test('renders the category label and averaged years across its skills', async () => {
    const screen = renderTooltip(true, [{ payload: frontendPoint, graphicalItemId: 'radar' }]);

    expect(screen.getByText('Frontend Development')).toBeVisible();
    expect(screen.getByText('2.5 years avg across 3 skills')).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('renders singular copy for a single year and single skill', () => {
    const screen = renderTooltip(true, [
      { payload: { ...frontendPoint, avgYears: 1, skillCount: 1 }, graphicalItemId: 'radar' },
    ]);

    expect(screen.getByText('1 year avg across 1 skill')).toBeVisible();
  });

  test('renders nothing when inactive', () => {
    const screen = renderTooltip(false, [{ payload: frontendPoint, graphicalItemId: 'radar' }]);

    expect(screen.container).toBeEmptyDOMElement();
  });

  test('renders nothing when the payload is empty', () => {
    const screen = renderTooltip(true, []);

    expect(screen.container).toBeEmptyDOMElement();
  });
});
