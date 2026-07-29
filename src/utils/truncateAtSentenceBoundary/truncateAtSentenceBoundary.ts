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

  // Search within the first maxLength characters for the nearest boundary
  const searchText = text.substring(0, maxLength);

  // Look for sentence boundaries first (highest priority)
  // These are complete thoughts, so no ellipsis needed
  const sentencePatterns = ['. ', '? ', '! '];

  for (const pattern of sentencePatterns) {
    const lastIndex = searchText.lastIndexOf(pattern);

    if (lastIndex !== -1) {
      return searchText.substring(0, lastIndex + 1);
    }
  }

  // If no sentence boundary found, look for comma boundaries (clause boundaries)
  // These are incomplete, so add ellipsis
  const lastCommaIndex = searchText.lastIndexOf(',');

  if (lastCommaIndex !== -1) {
    return searchText.substring(0, lastCommaIndex + 1) + '…';
  }

  // Fallback: truncate at word boundary
  const lastSpaceIndex = searchText.lastIndexOf(' ');

  if (lastSpaceIndex !== -1) {
    return searchText.substring(0, lastSpaceIndex) + '…';
  }

  // Last resort: hard truncate
  return searchText.substring(0, maxLength - 1) + '…';
};
