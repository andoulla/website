import { render, screen } from '@testing-library/react';

import type { Reference } from '../../../../data/references';

import { ReferenceQuote } from './ReferenceQuote';

const reference: Reference = {
  id: 'ref-1',
  jobId: 'job-1',
  authorName: 'Priya Shah',
  authorRole: 'Engineering Manager',
  quote: 'Great work.',
};

describe('ReferenceQuote', () => {
  test('renders the quote and attribution', () => {
    render(<ReferenceQuote reference={reference} />);
    expect(screen.getByText('“Great work.”')).toBeVisible();
    expect(screen.getByText('Priya Shah, Engineering Manager')).toBeVisible();
  });
});
