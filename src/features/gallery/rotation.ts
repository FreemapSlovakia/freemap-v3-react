/** Clockwise degrees the server turns the photo by, after its EXIF orientation. */
export type Rotation = 0 | 90 | 180 | 270;

export function rotateBy(rotation: Rotation, by: Rotation | -90): Rotation {
  return ((rotation + by + 360) % 360) as Rotation;
}

/**
 * CSS preview of a pending rotation, scaled so a quarter-turned photo fits the
 * box the unrotated one takes.
 */
export function rotationTransform(
  rotation: Rotation,
  aspect: number,
): string | undefined {
  if (!rotation) {
    return undefined;
  }

  const scale = rotation === 180 ? 1 : Math.min(aspect, 1 / aspect);

  return `rotate(${rotation}deg) scale(${scale})`;
}
