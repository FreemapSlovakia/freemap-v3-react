import { useCallback, useEffect, useRef } from 'react';

type Props = {
  value?: number | null;
  className?: string;
  size?: number;
  onChange?: (value: number) => void;
};

export function Azimuth({ value, className, size, onChange }: Props) {
  const strokeWidth = 20 / (size ?? 20);

  const dragging = useRef(false);

  const svg = useRef<SVGSVGElement | null>(null);

  const domPoint = useRef<DOMPoint | null>(null);

  function getCoordinates(e: MouseEvent): undefined | { x: number; y: number } {
    const pt = domPoint.current;

    if (!pt || !svg.current) {
      return undefined;
    }

    pt.x = e.clientX;

    pt.y = e.clientY;

    const { x, y } = pt.matrixTransform(svg.current.getScreenCTM()?.inverse());

    return { x, y };
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!onChange) {
        return;
      }

      if (e.type === 'mousedown') {
        if (e.currentTarget !== svg.current) {
          return;
        }

        e.preventDefault();

        dragging.current = true;
      } else if (!dragging.current) {
        return;
      }

      const mouse = getCoordinates(e);

      if (!mouse) {
        return;
      }

      const azimuth = Math.PI - Math.atan2(mouse.x, mouse.y);

      onChange((azimuth / Math.PI) * 180);
    },
    [onChange],
  );

  const handleMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  useEffect(() => {
    const svgCurrent = svg.current;

    if (!onChange || !svgCurrent) {
      return;
    }

    const body = document.body;

    svgCurrent.addEventListener('mousedown', handleMouseMove);

    body.addEventListener('mouseup', handleMouseUp);

    body.addEventListener('mousemove', handleMouseMove);

    body.addEventListener('mouseleave', handleMouseUp);

    return () => {
      svgCurrent.removeEventListener('mousedown', handleMouseMove);

      body.removeEventListener('mouseup', handleMouseUp);

      body.removeEventListener('mousemove', handleMouseMove);

      body.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [handleMouseUp, handleMouseMove, onChange]);

  function setSvg(element: SVGSVGElement | null) {
    svg.current = element;

    domPoint.current = element ? element.createSVGPoint() : null;
  }

  useEffect(() => {
    if (!onChange) {
      return;
    }
  }, [onChange]);

  return (
    <svg
      viewBox="-10 -10 20 20"
      width={size}
      height={size}
      className={className}
      ref={setSvg}
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
