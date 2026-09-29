import { setUrlUpdatingEnabled } from '@app/url/urlUpdating.js';
import ColorLib from 'color';
import { produce } from 'immer';
import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
} from 'react';
import type {
  Color,
  ShadingComponent,
  ShadingComponentType,
} from '../model/Shading.js';

export type Props = {
  diameter?: number;
  components: ShadingComponent[];
  /** Fills the dial, so each handle shows against what its colour lies on. */
  background?: Color;
  onChange: (components: ShadingComponent[]) => void;
  selectedId?: number;
  onSelect: (id: number) => void;
};

export const MANAGEABLE_TYPES: Partial<Record<ShadingComponentType, true>> = {
  'slope-classic': true,
  'hillshade-classic': true,
  'hillshade-igor': true,
};

// How far from a handle's centre a press still grabs it (finger-sized).
const HIT_RADIUS = 16;

export function ShadingComponentControl({
  components: shadings,
  background,
  diameter = 220,
  onChange,
  selectedId,
  onSelect,
}: Props) {
  const radius = diameter / 2;

  // Guides and handle outlines contrast with the fill; silver where the panel
  // shows through. Opaque, or the dot shows the line crossing it.
  const fill = background && ColorLib.rgb(background.slice(0, 3));

  const opaque = fill && background[3] >= 0.5;

  const guide = opaque
    ? fill
        .mix(ColorLib.rgb(fill.isLight() ? [0, 0, 0] : [255, 255, 255]), 0.5)
        .string()
    : 'silver';

  // The rim is elevation 0, so it must show whatever lies inside or behind it.
  const edge = opaque
    ? fill.isLight()
      ? 'black'
      : 'white'
    : 'var(--bs-body-color)';

  const dragRef = useRef<{
    id: number;
    pointerId: number;
    dx: number;
    dy: number;
  } | null>(null);

  // Suspend history writes for the whole dial drag so the stream of azimuth/
  // elevation values collapses into one entry instead of flooding pushState
  // (Safari caps it at 100/10s). `latestComponents` holds the last value so
  // drag-end can commit it as a single history entry.
  const suspendedRef = useRef(false);

  const latestComponentsRef = useRef<ShadingComponent[] | null>(null);

  const svg = useRef<SVGSVGElement | null>(null);

  const domPoint = useRef<DOMPoint | null>(null);

  function getCoordinates(e: ReactPointerEvent) {
    const pt = domPoint.current;

    if (!pt || !svg.current) {
      return undefined;
    }

    pt.x = e.clientX;

    pt.y = e.clientY;

    const { x, y } = pt.matrixTransform(svg.current.getScreenCTM()?.inverse());

    return { x, y };
  }

  function handlePointerDown(e: ReactPointerEvent<SVGSVGElement>) {
    if (!e.isPrimary || e.button !== 0 || dragRef.current) {
      return;
    }

    const mouse = getCoordinates(e);

    if (!mouse) {
      return;
    }

    // The nearest handle within reach, so a finger-sized area never hides a
    // neighbouring handle.
    let nearest: (typeof handles)[number] | undefined;

    let nearestDistance = HIT_RADIUS;

    for (const handle of handles) {
      const distance = Math.hypot(mouse.x - handle.cx, mouse.y - handle.cy);

      if (distance <= nearestDistance) {
        nearest = handle;

        nearestDistance = distance;
      }
    }

    if (!nearest) {
      return;
    }

    e.preventDefault();

    e.currentTarget.setPointerCapture(e.pointerId);

    dragRef.current = {
      id: nearest.shading.id,
      pointerId: e.pointerId,
      dx: mouse.x - nearest.cx,
      dy: mouse.y - nearest.cy,
    };

    onSelect(nearest.shading.id);
  }

  function handlePointerMove(e: ReactPointerEvent) {
    const dragging = dragRef.current;

    if (!dragging || e.pointerId !== dragging.pointerId) {
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

    const elevation = (1 - Math.min(1, hypot / radius)) * (Math.PI / 2);

    const next = produce(shadings, (draft) => {
      const shading = draft.find((shading) => shading.id === dragging.id);

      if (
        shading?.type === 'hillshade-classic' ||
        shading?.type === 'slope-classic'
      ) {
        shading.elevation = elevation;
      }

      if (
        shading?.type === 'hillshade-classic' ||
        shading?.type === 'hillshade-igor'
      ) {
        shading.azimuth = azimuth;
      }
    });

    if (!suspendedRef.current) {
      suspendedRef.current = true;

      setUrlUpdatingEnabled(false);
    }

    latestComponentsRef.current = next;

    onChange(next);
  }

  // Fires after pointerup and pointercancel alike, as both release capture.
  function handleLostPointerCapture(e: ReactPointerEvent) {
    if (dragRef.current?.pointerId !== e.pointerId) {
      return;
    }

    dragRef.current = null;

    if (suspendedRef.current) {
      suspendedRef.current = false;

      // Re-enable first so the flush commits one history entry.
      setUrlUpdatingEnabled(true);

      if (latestComponentsRef.current) {
        onChange(latestComponentsRef.current);
      }
    }

    latestComponentsRef.current = null;
  }

  // Otherwise a handle drag scrolls the panel, cancelling the pointer.
  // pointerdown precedes touchstart, so the drag is known here; React's
  // onTouchStart is passive and can't prevent.
  useEffect(() => {
    const element = svg.current;

    if (!element) {
      return;
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (dragRef.current) {
        e.preventDefault();
      }
    };

    element.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  useEffect(
    () => () => {
      if (suspendedRef.current) {
        suspendedRef.current = false;

        setUrlUpdatingEnabled(true);
      }
    },
    [],
  );

  function setSvg(element: SVGSVGElement | null) {
    svg.current = element;

    domPoint.current = element ? element.createSVGPoint() : null;
  }

  const items = shadings.map((shading) => {
    const ele =
      shading.type === 'hillshade-classic' || shading.type === 'slope-classic'
        ? 1 - shading.elevation / (Math.PI / 2)
        : 1;

    const azimuth = 'azimuth' in shading ? shading.azimuth : 0;

    return {
      shading,
      cx: radius * ele * Math.sin(Math.PI - azimuth),
      cy: radius * ele * Math.cos(Math.PI - azimuth),
    };
  });

  const handles = items.filter(({ shading }) => MANAGEABLE_TYPES[shading.type]);

  const size = diameter + 16;

  return (
    <svg
      width={size}
      height={size}
      viewBox={[-size / 2, -size / 2, size, size].join(' ')}
      ref={setSvg}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onLostPointerCapture={handleLostPointerCapture}
    >
      <circle
        cx={0}
        cy={0}
        r={radius}
        style={{
          fill: background ? `rgba(${background.join(',')})` : 'none',
          strokeWidth: '1px',
          stroke: edge,
        }}
      />

      {items
        .filter(({ shading }) => shading.type.startsWith('hillshade-'))
        .map(({ shading, cx, cy }) => (
          <line
            key={shading.id}
            x1={0}
            y1={0}
            x2={cx}
            y2={cy}
            stroke={guide}
            strokeDasharray="4 2"
          />
        ))}

      <circle cx={0} cy={0} r={3} style={{ fill: guide }} />

      {handles.map(({ shading, cx, cy }) => (
        <circle
          key={shading.id}
          cx={cx}
          cy={cy}
          r={7}
          style={{
            fill: `rgba(${shading.colorStops[0].color.join(',')})`,
            stroke: guide,
            cursor: 'move',
          }}
        />
      ))}

      {handles
        .filter(({ shading }) => selectedId === shading.id)
        .map(({ shading, cx, cy }) => (
          // Black dashes over white, so some of it shows on any fill.
          <g key={shading.id} style={{ fill: 'none', strokeWidth: 1 }}>
            <circle r={9} cx={cx} cy={cy} stroke="white" />

            <circle
              r={9}
              cx={cx}
              cy={cy}
              stroke="black"
              strokeDasharray="2 2"
            />
          </g>
        ))}
    </svg>
  );
}
