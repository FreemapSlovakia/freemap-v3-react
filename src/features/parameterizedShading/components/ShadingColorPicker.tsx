import { setUrlUpdatingEnabled } from '@app/url/urlUpdating.js';
import ColorPicker from '@zdila/react-gradient-color-picker';
import Color from 'color';
import { produce } from 'immer';
import { type ReactElement, useRef, useState } from 'react';
import type {
  ColorStop,
  Color as ColorType,
  Shading,
  ShadingComponent,
} from '../model/Shading.js';

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
  const [color, setColor] = useState('');

  const [activeStopIndex, setActiveStopIndex] = useState<number>();

  // Holds the shading produced by the most recent color-picker onChange so the
  // drag-end handler can commit it as a single history entry.
  const latestShadingRef = useRef(shading);

  const isGradientComponent =
    component?.type === 'aspect' || component?.type === 'color-relief';

  // For gradient components the stop value is stored in real units (aspect in
  // radians, color-relief in meters). `max` scales those into the picker's 0-100%
  // stops; `displayMax`/`unit` make the stop input read back in user-facing units.
  const stopScale =
    component?.type === 'aspect'
      ? { max: 2 * Math.PI, displayMax: 360, unit: '°' }
      : { max: colorReliefMax, displayMax: colorReliefMax, unit: 'm' };

  return (
    <ColorPicker
      className="mt-3"
      {...(isGradientComponent
        ? {
            stopMin: 0,
            stopMax: stopScale.displayMax,
            stopUnit: stopScale.unit,
          }
        : {})}
      height={120}
      width={236}
      hideGradientAngle
      hideGradientType
      hideColorTypeBtns
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
        } else if (
          component.type === 'aspect' ||
          component.type === 'color-relief'
        ) {
          v =
            'linear-gradient(90deg, ' +
            component.colorStops
              .map(
                (colorStop, i) =>
                  (activeStopIndex === i ? 'RGBA' : 'rgba') +
                  `(${colorStop.color.join(',')}) ${(100 * colorStop.value) / stopScale.max}%`,
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
            ...picked.matchAll(/(r)gba?\(([^)]+)\) (\d+(?:\.\d+)?%)/gi),
          ].map(([, r, rgba, stop], i) => {
            if (r === 'R') {
              activeIndex = i;
            }

            const c = rgba.split(',').map(Number) as ColorType;

            if (c.length < 4) {
              c.push(1);
            }

            return {
              value: (parseFloat(stop) / 100) * stopScale.max,
              color: c,
            };
          });

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
  );
}
