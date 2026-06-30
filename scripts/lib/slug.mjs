// Lowercases and hyphenates, e.g. "Acme Corp & Co." -> "acme-corp-co".
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Returns `base`, or `base-2`, `base-3`, ... on collision. Mutates `usedIds`.
// Content-derived, not position-derived, so re-imports don't shift unrelated ids.
export function uniqueId(base, usedIds) {
  let id = base;
  let suffix = 2;
  while (usedIds.has(id)) {
    id = `${base}-${suffix}`;
    suffix++;
  }
  usedIds.add(id);
  return id;
}
