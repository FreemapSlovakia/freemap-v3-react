import type { ReactElement } from 'react';

/**
 * The lit part of a unit moon facing right, for `age` as `moonAge` gives it:
 * a half circle on the lit side, closed by half an ellipse bowed towards that
 * side for a crescent and away from it past a quarter.
 */
export function moonLitPath(age: number): string {
  // Half the terminator's width: 1 at new and full, 0 at a quarter.
  const k = Math.cos((age * Math.PI) / 180);

  return `M0,-1A1,1 0 0 1 0,1A${Math.abs(k)},1 0 0 ${k > 0 ? 0 : 1} 0,-1Z`;
}

/**
 * The moon in its phase, sized like an icon: lit on the right while waxing as
 * the northern hemisphere sees it, mirrored for the southern. Light and dark
 * are fixed colours, not the text's, which would invert them on a light theme.
 */
export function MoonPhase({
  age,
  south = false,
}: {
  age: number;
  south?: boolean;
}): ReactElement {
  const facing = age < 180 !== south ? 90 : 270;

  return (
    <svg viewBox="-1.1 -1.1 2.2 2.2" width="1em" height="1em">
      <circle r={1} fill="#3a3a3a" />

      <path
        d={moonLitPath(age)}
        transform={`rotate(${facing - 90})`}
        fill="#f4f1de"
      />

      <circle r={1} fill="none" stroke="currentColor" strokeWidth={0.1} />
    </svg>
  );
}
