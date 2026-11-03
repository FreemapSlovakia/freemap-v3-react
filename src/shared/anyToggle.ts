/** The value of an "Any" toggle beside multi-select toggles meaning "none picked". */
export const ANY = '*';

/** The toggles' value: "Any" stands lit while nothing is picked. */
export const withAnyValue = <T extends string>(
  picked: readonly T[],
): (T | typeof ANY)[] => (picked.length ? [...picked] : [ANY]);

/**
 * What a change of the toggles picks: pressing "Any" clears the rest, and
 * picking anything else puts it out.
 */
export function fromAnyValue<T extends string>(
  next: readonly (T | typeof ANY)[],
  picked: readonly T[],
): T[] {
  return next.includes(ANY) && picked.length
    ? []
    : next.filter((v): v is T => v !== ANY);
}
