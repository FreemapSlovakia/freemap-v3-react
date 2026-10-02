/** An overlay as stacking sees it. */
export type StackItem = {
  type: string;
  /** Its default place: higher draws above. */
  zIndex?: number;
  /** Drawn above the tile overlays whatever its place; not reordered. */
  pinned?: boolean;
};

const zOf = (item: StackItem | undefined) => item?.zIndex ?? 1;

/**
 * The overlays top first: the pinned ones, then the user's `order`, with any
 * overlay it doesn't name slotted in by its default `zIndex`; on a tie the one
 * later in `items` (the user's own after the built-ins) goes above.
 */
export function overlayStack(
  items: readonly StackItem[],
  order: readonly string[],
): string[] {
  const byType = new Map(items.map((item) => [item.type, item]));

  // Bottom first: by z-index, then by place in `items`.
  const ascending = (list: readonly StackItem[]) =>
    [...list]
      .map((item, i) => ({ item, i }))
      .sort((a, b) => zOf(a.item) - zOf(b.item) || a.i - b.i)
      .map(({ item }) => item.type);

  const pinned = ascending(items.filter((item) => item.pinned)).reverse();

  const listed = order.filter((type) => {
    const item = byType.get(type);

    return item !== undefined && !item.pinned;
  });

  const listedSet = new Set(listed);

  const stack = [...listed];

  for (const type of ascending(
    items.filter((item) => !item.pinned && !listedSet.has(item.type)),
  )) {
    const z = zOf(byType.get(type));

    // Above the first one it doesn't rank below.
    const at = stack.findIndex((other) => zOf(byType.get(other)) <= z);

    stack.splice(at === -1 ? stack.length : at, 0, type);
  }

  return [...pinned, ...stack];
}
