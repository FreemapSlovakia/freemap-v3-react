/** A ref callback that brings a picked-out list row into view. */
export const scrollIntoCenter = (el: Element | null): void => {
  el?.scrollIntoView({ block: 'center' });
};
