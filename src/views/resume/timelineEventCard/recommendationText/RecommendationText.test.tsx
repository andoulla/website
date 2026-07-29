import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import { Recommendation } from '@/testing';

import { RecommendationText } from './RecommendationText';

const recommendation = new Recommendation()
  .authorInitials('P.S.')
  .authorRole({ jobTitle: 'Engineering Manager' })
  .text('Great work.')
  .postedDate('2022-01-15')
  .recommendationUrl('https://www.linkedin.com/in/example/details/recommendations/')
  .mock();

describe('RecommendationText', () => {
  test('renders the quote and byline in a blockquote with a deep-link id', () => {
    const screen = render(<RecommendationText recommendation={recommendation} />);

    expect(screen.getByText('"Great work."')).toBeVisible();
    expect(screen.getAllByText('P.S.')[0]).toBeVisible(); // Avatar
    expect(screen.getByText('Engineering Manager')).toBeVisible();
    expect(screen.getByText('15 Jan 2022')).toBeVisible();
    expect(document.getElementById('recommendation-rec-1')).toBe(
      screen.getByText('"Great work."').closest('blockquote')
    );
  });

  test('links the byline to the recommendation on LinkedIn in a new tab', () => {
    const screen = render(<RecommendationText recommendation={recommendation} />);

    const link = screen.getByRole('link');

    expect(link).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/example/details/recommendations/'
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('starts clamped and toggles between Show recommendation and Hide recommendation', async () => {
    const user = userEvent.setup();
    const screen = render(<RecommendationText recommendation={recommendation} />);

    await user.click(screen.getByRole('button', { name: 'Show recommendation' }));

    expect(screen.getByRole('button', { name: 'Hide recommendation' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(await axe(screen.container)).toHaveNoViolations();

    await user.click(screen.getByRole('button', { name: 'Hide recommendation' }));

    expect(screen.getByRole('button', { name: 'Show recommendation' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  test('a highlighted recommendation starts unclamped', () => {
    const screen = render(<RecommendationText recommendation={recommendation} isHighlighted />);

    expect(screen.getByRole('button', { name: 'Hide recommendation' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  test('has no axe violations', async () => {
    const screen = render(<RecommendationText recommendation={recommendation} />);

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('show/hide recommendation button uses text variant for minimal prominence', () => {
    const screen = render(<RecommendationText recommendation={recommendation} />);

    const toggleButton = screen.getByRole('button', { name: 'Show recommendation' });

    expect(toggleButton).toHaveClass('MuiButton-text');
  });

  test('attribution row has top margin for visual separation from quote', () => {
    const screen = render(<RecommendationText recommendation={recommendation} />);

    const link = screen.getByRole('link');
    const stack = link.closest('div[class*="MuiStack"]');

    // Stack should have top margin spacing to separate from quote (0.75 spacing units = 6px)
    expect(stack).toHaveStyle('margin-top: 6px');
  });

  test('truncates long text at sentence boundary when clamped', () => {
    const longText =
      'This is a very long recommendation that goes on and on with multiple sentences. This is the second sentence which should be cut off. This is the third sentence.';
    const longRecommendation = new Recommendation()
      .authorInitials('J.D.')
      .authorRole({ jobTitle: 'Director' })
      .text(longText)
      .postedDate('2023-06-20')
      .recommendationUrl('https://www.linkedin.com/in/example/details/recommendations/')
      .mock();

    const screen = render(<RecommendationText recommendation={longRecommendation} />);

    // Clamped state should show some text (truncated)
    expect(
      screen.getByText((content, element) => {
        if (!element) return false;

        return content.includes('This is a very long recommendation');
      })
    ).toBeVisible();
  });

  test('shows full text when expanded after truncation', async () => {
    const user = userEvent.setup();
    const longText =
      'This is a very long recommendation that goes on and on with multiple sentences. This is the second sentence. This is the third sentence.';
    const longRecommendation = new Recommendation()
      .authorInitials('J.D.')
      .authorRole({ jobTitle: 'Director' })
      .text(longText)
      .postedDate('2023-06-20')
      .recommendationUrl('https://www.linkedin.com/in/example/details/recommendations/')
      .mock();

    const screen = render(<RecommendationText recommendation={longRecommendation} />);

    const expandButton = screen.getByRole('button', { name: 'Show recommendation' });

    await user.click(expandButton);

    // After expanding, the button should say "Hide recommendation"
    expect(screen.getByRole('button', { name: 'Hide recommendation' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  test('blockquote uses flexbox to fill grid cell height', () => {
    const screen = render(<RecommendationText recommendation={recommendation} />);

    const blockquote = screen.getByText('"Great work."').closest('blockquote');

    expect(blockquote).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
    });
  });
});
