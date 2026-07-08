// True when there's no term to search by.
export const isSearchTermEmpty = (searchTerm?: string): boolean =>
  searchTerm === undefined || searchTerm.trim() === '';
