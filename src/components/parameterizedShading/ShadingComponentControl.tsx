import { produce } from 'immer';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ShadingComponent, ShadingComponentType } from './Shading.js';

export type Props = {
  diameter?: number;
  components: ShadingComponent[];
  onChange: (components: ShadingComponent[]) => void;
  selectedId?: number;
  onSelect: (id: number) => void;
};

export const MANAGEABLE_TYPES: Partial<Record<ShadingComponentType, true>> = {
  'slope-classic': true,
  'hillshade-classic': true,
  'hillshade-igor': true,
};

export function ShadingComponentControl({
  components: shadings,
  diameter = 220,
  onChange,
  selectedId,
  onSelect,
}: Props) {
  const radius = diameter / 2;

  const gid = useRef(Math.random().toString(32).slice(2));

  const [dragging, setDragging] = useState<{
    id: number;
    dx: number;
    dy: number;
  } | null>(null);

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
      if (!dragging) {
        return;
      }

      const mouse = getCoordinates(e);

      if (!mouse) {
        return;
      }

      const x = mouse.x - dragging.dx;

      const y = mouse.y - dragging.dy;

      const hypot = Math.hypot(x, y);

      const azimuth = Math.PI - Math.atan2(x, y);

      const elevation = Math.min(1, hypot / radius) * (Math.PI / 2);

      const dragged = dragging;

      onChange(
        produce(shadings, (draft) => {
          const shading = draft.find((shading) => shading.id === dragged.id);

          if (shading) {
            shading.elevation = elevation;

            shading.azimuth = azimuth;
          }
        }),
      );
    },
    [radius, dragging, onChange, shadings],
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!(e.target instanceof SVGCircleElement)) {
        return undefined;
      }

      e.preventDefault();

      const id = Number(e.target.dataset['sc_' + gid.current]);

      const mouse = getCoordinates(e);

      if (!mouse) {
        return;
      }

      const shading = shadings.find((shading) => shading.id === id);

      if (!shading) {
        return;
      }

      const ele = shading.type.endsWith('-classic')
        ? shading.elevation / (Math.PI / 2)
        : 1;

      setDragging({
        id: shading.id,
        dx: mouse.x - radius * ele * Math.sin(Math.PI - shading.azimuth),
        dy: mouse.y - radius * ele * Math.cos(Math.PI - shading.azimuth),
      });

      onSelect(shading.id);
    },
    [shadings, radius, onSelect],
  );

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  useEffect(() => {
    const body = document.body;

    body.addEventListener('mousedown', handleMouseDown);

    body.addEventListener('mouseup', handleMouseUp);

    body.addEventListener('mousemove', handleMouseMove);

    body.addEventListener('mouseleave', handleMouseUp);

    return () => {
      body.removeEventListener('mousedown', handleMouseDown);

      body.removeEventListener('mouseup', handleMouseUp);

      body.removeEventListener('mousemove', handleMouseMove);

      body.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseUp, handleMouseMove]);

  function setSvg(element: SVGSVGElement | null) {
    svg.current = element;

    domPoint.current = element ? element.createSVGPoint() : null;
  }

  const items = shadings.map((shading) => {
    const ele = shading.type.endsWith('-classic')
      ? shading.elevation / (Math.PI / 2)
      : 1;

    return {
      ...shading,
      cx: radius * ele * Math.sin(Math.PI - shading.azimuth),
      cy: radius * ele * Math.cos(Math.PI - shading.azimuth),
    };
  });

  return (
    <svg
      width={diameter + 16}
      height={diameter + 16}
      viewBox={[
        -diameter / 2 - 8,
        -diameter / 2 - 8,
        diameter + 16,
        diameter + 16,
      ].join(' ')}
      ref={setSvg}
    >
      <circle
        cx={0}
        cy={0}
        r={diameter / 2}
        style={{ fill: 'none', strokeWidth: '1px', stroke: 'black' }}
      />

      {items
        .filter((shading) => shading.type.startsWith('hillshade-'))
        .map((shading) => (
          <line
            key={shading.id}
            x1={0}
            y1={0}
            x2={shading.cx}
            y2={shading.cy}
            stroke="silver"
            strokeDasharray="4 2"
          />
        ))}

      <circle cx={0} cy={0} r={3} style={{ fill: 'silver' }} />

      {items
        .filter((shading) => MANAGEABLE_TYPES[shading.type])
        .map((shading) => (
          <circle
            key={shading.id}
            cx={shading.cx}
            cy={shading.cy}
            r={7}
            style={{
              fill: `rgba(${shading.colorStops[0].color.join(',')})`,
              stroke: 'silver',
            }}
            {...{ [`data-sc_${gid.current}`]: shading.id }}
          />
        ))}

      {items
        .filter((shading) => MANAGEABLE_TYPES[shading.type])
        .filter((shading) => selectedId === shading.id)
        .map((shading) => (
          <circle
            key={shading.id}
            r={8}
            cx={shading.cx}
            cy={shading.cy}
            style={{
              fill: 'none',
              strokeWidth: 1,
              stroke: 'blue',
              strokeDasharray: '2 2',
              pointerEvents: 'none',
            }}
          />
        ))}
    </svg>
  );
}
