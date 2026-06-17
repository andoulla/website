import { render } from '@testing-library/react';

import type { Reference } from '../../../../data/references';

import { ReferenceQuote } from './ReferenceQuote';

const reference: Reference = {
  id: 'ref-1',
  jobId: 'job-1',
  authorName: 'Priya Shah',
  authorRole: 'Engineering Manager',
  quote: 'Great work.',
};

test('renders the quote and attribution', () => {
  const { container } = render(<ReferenceQuote reference={reference} />);
  expect(container).toHaveTextContent('Great work.');
  expect(container).toHaveTextContent('Priya Shah, Engineering Manager');
});
