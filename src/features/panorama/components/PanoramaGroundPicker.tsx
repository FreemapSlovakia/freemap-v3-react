import { toRgbaString } from '@shared/colorAlpha.js';
import { ColorPickerPopover } from '@shared/components/ColorPickerPopover.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDragCommit } from '@shared/hooks/useDragCommit.js';
import ColorPicker from '@zdila/react-gradient-color-picker';
import Color from 'color';
import { type ReactElement, useState } from 'react';
import {
  cssToStops,
  GRADIENT_PRESETS,
  gradientToCss,
  PANORAMA_GRADIENT_DEFAULT,
  type PanoramaGradient,
  previewStops,
  storedStops,
} from '../gradient.js';
import { usePanoramaMessages } from '../translations/usePanoramaMessages.js';

type Ground = { color: string; gradient: PanoramaGradient | null };

type Props = Ground & { onChange: (value: Ground) => void };

/**
 * The ground, as one colour or as a distance ramp — the picker's own
 * Solid/Gradient tabs decide which, so there is no separate switch to keep in
 * step with the value. Its swatches are ready-made ramps rather than recent
 * colours: a gradient is where the interesting looks are, and it is also how
 * the feature is found at all.
 */
export function PanoramaGroundPicker({
  color,
  gradient,
  onChange,
}: Props): ReactElement {
  const m = usePanoramaMessages();

  // After the built-in ones rather than before, so a swatch stays where it was
  // found as ramps of the user's own accumulate behind it.
  const recent = useAppSelector(
    (state) => state.panoramaSettings.recentGradients,
  );

  /** Which stop the picker has selected, so handing the value back keeps it. */
  const [active, setActive] = useState<number>();

  const { change, onDragStart, onDragEnd } = useDragCommit(onChange);

  // The picker wants a colour it can parse back out of its own inputs, which is
  // what every other picker here hands it too.
  const css = gradient
    ? gradientToCss(previewStops(gradient), active)
    : toRgbaString(color);

  const emit = (picked: string) => {
    const parsed = cssToStops(picked);

    setActive(parsed?.active);

    const next: Ground = parsed
      ? {
          color,
          // Everything but the stops carries over, so switching tabs or taking
          // a swatch leaves the fade, the far distance and the clipping alone.
          gradient: {
            ...(gradient ?? PANORAMA_GRADIENT_DEFAULT),
            stops: storedStops(gradient, parsed.stops),
          },
        }
      : { color: Color(picked).hex().toLowerCase(), gradient: null };

    change(next);
  };

  const presets = [
    ...GRADIENT_PRESETS,
    ...recent.map((stops) => gradientToCss(stops)),
  ];

  return (
    // The picker's own value doubles as the swatch: CSS colour functions are
    // case-insensitive, so the selected stop's `RGBA` draws like the rest.
    <ColorPickerPopover swatch={css} onHide={onDragEnd}>
      <ColorPicker
        value={css}
        onChange={emit}
        width={236}
        height={120}
        presets={presets}
        // What the gradient tab switches to where there is no ramp yet.
        config={{ defaultGradient: GRADIENT_PRESETS[0] }}
        locales={{
          CONTROLS: {
            SOLID: m?.settings.groundSolid ?? '',
            GRADIENT: m?.settings.groundGradient ?? '',
          },
        }}
        // One linear ramp, angle and all: the service maps distance to a
        // position along it and knows nothing of directions or shapes.
        hideGradientType
        hideGradientAngle
        stopUnit="%"
        hideOpacity
        hideEyeDrop
        hideAdvancedSliders
        hideColorGuide
        // The hex/RGB fields stay, as the ridge colour's picker has them;
        // only the model dropdown goes, the same as there.
        hideInputType
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />
    </ColorPickerPopover>
  );
}
