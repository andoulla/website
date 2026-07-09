import { render } from '@testing-library/react';
import Business from '@mui/icons-material/Business';

import { TimelineEvent } from '@/testing';

import { RoleIcon } from './RoleIcon';

describe('RoleIcon', () => {
  test('renders the mapped logo image for a known education entry', () => {
    const event = new TimelineEvent()
      .id('city-st-georges-university-of-london-2011-09')
      .type('education')
      .companyName("City St George's, University of London")
      .mock();

    const screen = render(<RoleIcon event={event} fallbackIcon={Business} />);

    const logo = screen.getByRole('img', { name: "City St George's, University of London logo" });

    expect(logo).toBeVisible();
  });

  test('renders the School icon for an education entry with no mapped logo', () => {
    const event = new TimelineEvent().id('unmapped-education-entry').type('education').mock();

    const screen = render(<RoleIcon event={event} fallbackIcon={Business} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByTestId('SchoolIcon')).toBeInTheDocument();
  });

  test('renders the fallback icon for a work entry with no mapped logo', () => {
    const event = new TimelineEvent().id('unmapped-work-entry').type('work').mock();

    const screen = render(<RoleIcon event={event} fallbackIcon={Business} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByTestId('BusinessIcon')).toBeInTheDocument();
  });
});
