import type { PointerEvent, ReactElement } from 'react';

type Props = {
  value?: number | null;
  className?: string;
  size?: number;
  onChange?: (value: number) => void;
};

export function Azimuth({
  value,
  className,
  size,
  onChange,
}: Props): ReactElement {
  const strokeWidth = 20 / (size ?? 20);

  const update = (e: PointerEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;

    const pt = svg.createSVGPoint();

    pt.x = e.clientX;

    pt.y = e.clientY;

    const { x, y } = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    onChange?.(((Math.PI - Math.atan2(x, y)) / Math.PI) * 180);
  };

  return (
    <svg
      viewBox="-10 -10 20 20"
      width={size}
      height={size}
      className={className}
      style={onChange ? { touchAction: 'none', cursor: 'pointer' } : undefined}
      onPointerDown={
        onChange &&
        ((e) => {
          e.preventDefault();

          e.currentTarget.setPointerCapture(e.pointerId);

          update(e);
        })
      }
      onPointerMove={
        onChange &&
        ((e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            update(e);
          }
        })
      }
    >
      <circle
        cx="0"
        cy="0"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />

      {value != null && (
        <path
          transform={`rotate(${value - 90 - 45})`}
          d="M 0 0 L 9 0 A 9 9 0 0 1 0 9 Z"
          fill="#aaf"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
      )}
    </svg>
  );
}
