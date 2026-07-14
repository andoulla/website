export interface Responsibility {
  id: string;
  text: string;
  /** Skills this bullet demonstrates (sorted); empty = universal, shown in every track. */
  skillIds: string[];
}
