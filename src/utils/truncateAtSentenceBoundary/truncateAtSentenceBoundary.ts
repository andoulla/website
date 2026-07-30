/**
 * Truncates text at the nearest sentence or clause boundary to the max length.
 * Detects boundaries: ". ", "? ", "! " (sentence ends) and ", " (clause boundaries)
 *
 * @param text The text to truncate
 * @param maxLength The maximum character length before truncation should occur
 * @returns The truncated text with ellipsis for incomplete clauses/words, or without if ending at sentence
 */
export const truncateAtSentenceBoundary = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }

  const searchText = text.substring(0, maxLength);

  // Sentence boundaries (., ?, !) — complete, so no ellipsis
  const sentencePatterns = ['. ', '? ', '! '];

  for (const pattern of sentencePatterns) {
    const lastIndex = searchText.lastIndexOf(pattern);

    if (lastIndex !== -1) {
      return searchText.substring(0, lastIndex + 1);
    }
  }

  // Comma boundaries — incomplete, so add ellipsis
  const lastCommaIndex = searchText.lastIndexOf(',');

  if (lastCommaIndex !== -1) {
    return searchText.substring(0, lastCommaIndex + 1) + '…';
  }

  // Word boundary
  const lastSpaceIndex = searchText.lastIndexOf(' ');

  if (lastSpaceIndex !== -1) {
    return searchText.substring(0, lastSpaceIndex) + '…';
  }

  // Hard truncate as last resort
  return searchText.substring(0, maxLength - 1) + '…';
};
