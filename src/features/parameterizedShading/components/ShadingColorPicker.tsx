import { setUrlUpdatingEnabled } from '@app/url/urlUpdating.js';
import { useBsTheme } from '@shared/hooks/useBsTheme.js';
import ColorPicker from '@zdila/react-gradient-color-picker';
import Color from 'color';
import { produce } from 'immer';
import { type ReactElement, useLayoutEffect, useRef, useState } from 'react';
import {
  type ColorStop,
  type Color as ColorType,
  MAX_COLOR_STOPS,
  type Shading,
  type ShadingComponent,
} from '../model/Shading.js';
import { useShadingMessages } from '../translations/useShadingMessages.js';

// The panel is translucent: the picker's own white box and lavender button
// strip would sit on it as solid patches.
const PICKER_STYLE = {
  // Its knobs carry huge z-indexes that would rise above the dropdown menus.
  body: { background: 'transparent', isolation: 'isolate' as const },
  rbgcpControlBtnWrapper: {
    background: 'rgba(var(--bs-body-color-rgb), 0.08)',
  },
};

// Until measured; what the light wheel beside it takes.
const MIN_WIDTH = 236;

type Props = {
  shading: Shading;
  selectedId?: number;
  component?: ShadingComponent;
  colorReliefMax: number;
  onChange: (shading: Shading) => void;
};

export function ShadingColorPicker({
  shading,
  selectedId,
  component,
  colorReliefMax,
  onChange,
}: Props): ReactElement {
  const dark = useBsTheme() === 'dark';

  const sm = useShadingMessages();

  const [color, setColor] = useState('');

  const [activeStopIndex, setActiveStopIndex] = useState<number>();

  // Holds the shading produced by the most recent color-picker onChange so the
  // drag-end handler can commit it as a single history entry.
  const latestShadingRef = useRef(shading);

  // Hillshade and slope take one colour or, switched in the picker, a gradient.
  const switchable =
    component?.type === 'hillshade-igor' ||
    component?.type === 'hillshade-classic' ||
    component?.type === 'slope-igor' ||
    component?.type === 'slope-classic';

  const isGradientComponent =
    component?.type === 'aspect' ||
    component?.type === 'color-relief' ||
    component?.type === 'curvature' ||
    (switchable && component.colorStops.length > 1);

  // For gradient components the stop value is stored in real units (aspect in
  // radians, color-relief in meters). `min`/`max` map those onto the picker's
  // 0-100% stops; `display*`/`unit` make the stop input read back in user-facing units.
  const stopScale = (() => {
    switch (component?.type) {
      case 'aspect':
        return {
          min: 0,
          max: 2 * Math.PI,
          displayMin: 0,
          displayMax: 360,
          unit: '°',
        };
      // The picker keeps whole percents, so a narrow range for fine stops.
      case 'curvature':
        return {
          min: -0.5,
          max: 0.5,
          displayMin: -50,
          displayMax: 50,
          unit: '%',
        };
      case 'slope-igor':
        return { min: 0, max: 90, displayMin: 0, displayMax: 90, unit: '°' };
      // Igor's hillshade reaches 2 on the steepest slopes facing away.
      case 'hillshade-igor':
        return { min: 0, max: 2, displayMin: 0, displayMax: 100, unit: '%' };
      case 'hillshade-classic':
      case 'slope-classic':
        return { min: 0, max: 1, displayMin: 0, displayMax: 100, unit: '%' };
      default:
        return {
          min: 0,
          max: colorReliefMax,
          displayMin: 0,
          displayMax: colorReliefMax,
          unit: 'm',
        };
    }
  })();

  const toPercent = (value: number) =>
    (100 * (value - stopScale.min)) / (stopScale.max - stopScale.min);

  // The picker takes its width in pixels; it spans the panel.
  const [box, setBox] = useState<HTMLDivElement | null>(null);

  const [width, setWidth] = useState(MIN_WIDTH);

  useLayoutEffect(() => {
    if (!box) {
      return;
    }

    // A box laid out nowhere reads 0; keep the last width then.
    const take = (w: number) => w > 0 && setWidth(Math.floor(w));

    take(box.getBoundingClientRect().width);

    const observer = new ResizeObserver(([entry]) =>
      take(entry?.contentRect.width ?? 0),
    );

    observer.observe(box);

    return () => observer.disconnect();
  }, [box]);

  return (
    <div ref={setBox}>
      <ColorPicker
        className="mt-3"
        style={PICKER_STYLE}
        // It follows the OS scheme otherwise, not the app's.
        disableDarkMode={dark ? undefined : true}
        disableLightMode={dark ? true : undefined}
        {...(isGradientComponent
          ? {
              stopMin: stopScale.displayMin,
              stopMax: stopScale.displayMax,
              stopUnit: stopScale.unit,
            }
          : {})}
        height={120}
        width={width}
        hideGradientAngle
        hideGradientType
        hideColorTypeBtns={!switchable}
        locales={{
          CONTROLS: { SOLID: sm?.solid ?? '', GRADIENT: sm?.gradient ?? '' },
        }}
        // Switched to a gradient, the layer's colour from clear to full, which
        // looks as the single colour did.
        config={(() => {
          const [r, g, b, a] = component?.colorStops.at(-1)?.color ?? [
            0, 0, 0, 1,
          ];

          return {
            defaultColor: `rgba(${r},${g},${b},${a})`,
            defaultGradient: `linear-gradient(90deg, rgba(${r},${g},${b},0) 0%, rgba(${r},${g},${b},${a}) 100%)`,
          };
        })()}
        hideInputs
        hideInputType
        // Suspend history writes for the whole pointer drag so the stream of
        // intermediate colors collapses into one entry instead of flooding
        // pushState (Safari caps it at 100/10s). The live map keeps updating
        // because onChange still dispatches on every frame.
        onDragStart={() => {
          setUrlUpdatingEnabled(false);
        }}
        onDragEnd={() => {
          // Re-enable first so the flush dispatch commits one history entry.
          setUrlUpdatingEnabled(true);

          onChange(latestShadingRef.current);
        }}
        value={(() => {
          let v: string;

          if (!component) {
            v = Color.rgb(shading.backgroundColor).string();
          } else if (isGradientComponent) {
            v =
              'linear-gradient(90deg, ' +
              component.colorStops
                .map(
                  (colorStop, i) =>
                    (activeStopIndex === i ? 'RGBA' : 'rgba') +
                    `(${colorStop.color.join(',')}) ${toPercent(colorStop.value)}%`,
                )
                .join(', ') +
              ')';
          } else {
            const c = component.colorStops[0].color ?? shading.backgroundColor;

            v = Color.rgb(c).string();
          }

          return v === color.toLowerCase() ? color : v;
        })()}
        onChange={(picked) => {
          setColor(picked);

          let colorStops: ColorStop[];

          let activeIndex: number | undefined;

          if (picked.startsWith('linear-gradient(')) {
            colorStops = [
              // Stops outside the picker's range come back below 0 or above 100%.
              ...picked.matchAll(/(r)gba?\(([^)]+)\) (-?\d+(?:\.\d+)?%)/gi),
            ].map(([, r, rgba, stop], i) => {
              if (r === 'R') {
                activeIndex = i;
              }

              const c = rgba.split(',').map(Number) as ColorType;

              if (c.length < 4) {
                c.push(1);
              }

              return {
                value:
                  stopScale.min +
                  (parseFloat(stop) / 100) * (stopScale.max - stopScale.min),
                color: c,
              };
            });

            // One stop too many is not added.
            if (colorStops.length > MAX_COLOR_STOPS) {
              return;
            }

            setActiveStopIndex(activeIndex);
          } else {
            const c = Color(picked).rgb().array() as ColorType;

            if (c.length < 4) {
              c.push(1);
            }

            colorStops = [{ value: 0, color: c }];
          }

          const next = produce(shading, (draft) => {
            if (selectedId === undefined) {
              draft.backgroundColor = colorStops[0].color;
            } else {
              const c = draft.components.find((c) => c.id === selectedId);

              if (c) {
                c.colorStops = colorStops;
              }
            }
          });

          latestShadingRef.current = next;

          onChange(next);
        }}
      />
    </div>
  );
}
