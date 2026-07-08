// Never inserted into the live DOM and only .textContent is read, so scripts in the
// input never execute — this is a safe way to strip HTML down to plain text.
export const stripHtmlToText = (html: string): string =>
  new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '';
