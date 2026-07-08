export const hasSearchTerm = (searchTerm?: string): searchTerm is string =>
  searchTerm !== undefined && searchTerm.trim() !== '';
