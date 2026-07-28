import type { CategoryGroup } from '..';

export const alignCompareGroups = (
  primaryGroups: CategoryGroup[],
  compareGroups: CategoryGroup[]
): { primary: CategoryGroup[]; compare: CategoryGroup[] } => {
  const compareById = new Map(compareGroups.map((group) => [group.category.id, group]));
  const primaryById = new Map(primaryGroups.map((group) => [group.category.id, group]));

  const sharedPrimary = primaryGroups.filter((group) => compareById.has(group.category.id));
  const primaryOnly = primaryGroups.filter((group) => !compareById.has(group.category.id));
  const compareOnly = compareGroups.filter((group) => !primaryById.has(group.category.id));

  const sharedCompare = sharedPrimary
    .map((group) => compareById.get(group.category.id))
    .filter((group): group is CategoryGroup => group !== undefined);

  return {
    primary: [...sharedPrimary, ...primaryOnly],
    compare: [...sharedCompare, ...compareOnly],
  };
};
