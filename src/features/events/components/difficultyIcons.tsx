import type { ReactElement } from 'react';
import type { Difficulty } from '../model/actions.js';

/** Four solid bars of rising height, the first `level` lit; sized as a glyph. */
function Bars({ level }: { level: number }): ReactElement {
  return (
    <svg
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      fill="currentColor"
      style={{ verticalAlign: '-0.125em' }}
    >
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={i * 4 + 0.5}
          y={12 - i * 3.5}
          width={3}
          height={3.5 + i * 3.5}
          rx={0.6}
          opacity={i < level ? 1 : 0.25}
        />
      ))}
    </svg>
  );
}

/** Difficulty as such, for its label: the meter full. */
export const DIFFICULTY_ICON = <Bars level={4} />;

export const DIFFICULTY_ICONS: Record<Difficulty, ReactElement> = {
  easy: <Bars level={1} />,
  moderate: <Bars level={2} />,
  demanding: <Bars level={3} />,
  expert: <Bars level={4} />,
};
