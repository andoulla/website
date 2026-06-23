/** Derive up to two uppercase initials from a person's name, e.g. "Priya Shah" -> "PS". */
export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}
