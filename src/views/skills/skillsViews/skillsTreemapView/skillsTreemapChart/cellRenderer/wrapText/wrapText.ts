// Approximate character width for bold 11px — used for greedy word-wrap.
const APPROX_CHAR_WIDTH = 6.5;

// Greedy word-wrap: splits text into lines that fit within maxWidth pixels.
export const wrapText = (text: string, maxWidth: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current.length > 0 ? `${current} ${word}` : word;

    if (candidate.length * APPROX_CHAR_WIDTH > maxWidth && current.length > 0) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current.length > 0) lines.push(current);

  return lines;
};
