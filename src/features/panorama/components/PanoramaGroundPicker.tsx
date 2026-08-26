import { setUrlUpdatingEnabled } from '@app/url/urlUpdating.js';
import { toRgbaString } from '@shared/colorAlpha.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import ColorPicker from '@zdila/react-gradient-color-picker';
import Color from 'color';
import {
  type ReactElement,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
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

  const [show, setShow] = useState(false);

  /** Which stop the picker has selected, so handing the value back keeps it. */
  const [active, setActive] = useState<number>();

  // Holds the last forwarded value so the drag-end handler can commit it as a
  // single history entry (see onDragStart/onDragEnd below). `onChange` rides a
  // ref for the same reason the handlers are stable: see there.
  const latestRef = useRef<Ground | null>(null);

  const onChangeRef = useRef(onChange);

  onChangeRef.current = onChange;

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

    latestRef.current = next;

    onChange(next);
  };

  // Stable, because the picker holds them in the deps of the effect that
  // attaches its window `pointerup` listener: fresh ones each render would
  // detach and reattach it on every frame of a stop being dragged.
  const suspendHistory = useCallback(() => {
    setUrlUpdatingEnabled(false);
  }, []);

  const resumeHistory = useCallback(() => {
    // Re-enabled first so the flush commits one history entry.
    setUrlUpdatingEnabled(true);

    if (latestRef.current) {
      onChangeRef.current(latestRef.current);
    }
  }, []);

  const presets = useMemo(
    () => [...GRADIENT_PRESETS, ...recent.map((stops) => gradientToCss(stops))],
    [recent],
  );

  return (
    <OverlayTrigger
      trigger="click"
      placement="bottom"
      rootClose
      show={show}
      onToggle={setShow}
      container={() => document.body}
      flip
      overlay={
        <Popover style={{ maxWidth: 'none' }}>
          <Popover.Body className="p-2">
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
              // Suspend history writes for the whole pointer drag so the stream
              // of intermediate colours collapses into one entry instead of
              // flooding pushState (Safari caps it at 100/10s).
              onDragStart={suspendHistory}
              onDragEnd={resumeHistory}
            />
          </Popover.Body>
        </Popover>
      }
    >
      <button
        type="button"
        className="form-control p-0"
        style={{
          cursor: 'pointer',
          height: 'calc(1.5em + 0.75rem + 2px)',
        }}
      >
        {/* The picker's own value doubles as the swatch: CSS reads the active
            stop's upper-cased `RGBA` the same as any other. */}
        <div
          className="w-100 h-100"
          style={{ background: css, borderRadius: 'inherit' }}
        />
      </button>
    </OverlayTrigger>
  );
}
