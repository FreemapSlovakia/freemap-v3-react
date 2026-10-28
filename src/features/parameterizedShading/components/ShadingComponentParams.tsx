import { setUrlUpdatingEnabled } from '@app/url/urlUpdating.js';
import { Text } from '@features/l10n/Text.js';
import { LabeledSlider } from '@shared/components/LabeledSlider.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDevicePixelRatio } from '@shared/hooks/useDevicePixelRatio.js';
import { produce } from 'immer';
import {
  type ReactElement,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Accordion, Form, InputGroup } from 'react-bootstrap';
import { FaExclamationTriangle } from 'react-icons/fa';
import { skyViewStops } from '../model/createShadingComponent.js';
import {
  centreGroundPx,
  MAX_RADIUS_M,
  MAX_RADIUS_PX,
  metresToPx,
  RADIUS_UNITS,
  type RadiusUnit,
  type Shading,
  type ShadingComponent,
  SKY_MODES,
  type SkyMode,
} from '../model/Shading.js';
import { useShadingMessages } from '../translations/useShadingMessages.js';

type Param =
  | 'exaggeration'
  | 'azimuth'
  | 'elevation'
  | 'contrast'
  | 'brightness'
  | 'interval'
  | 'lineWidth';

// A label may wrap onto a second line, so the input keeps to the bottom.
const FIELD = 'd-flex flex-column justify-content-end';

// An equal share, but never narrower than a value such as 315.5 and its unit need.
const FIELD_STYLE = { flex: '1 1 8rem', minWidth: '8rem' };

// Fields side by side; one too narrow for its value moves to the next line.
const ROW = 'd-flex flex-wrap gap-2';

type NumberFieldProps = {
  value: number;
  fractionDigits: number;
  min: number;
  max: number;
  step?: number;
  /** Small, beside a slider's name. */
  compact?: boolean;
  /** Shown after the value: a unit, or input-group addons. */
  unit?: ReactNode;
  onChange: (value: number) => void;
};

// Keeps what is typed while focused, so a partial number such as "1." or "-"
// isn't replaced by the formatted value mid-edit — until the value changes
// from elsewhere (a slider, the dial).
function NumberField({
  value,
  fractionDigits,
  min,
  max,
  step,
  compact,
  unit,
  onChange,
}: NumberFieldProps): ReactElement {
  const [draft, setDraft] = useState<{ text: string; value: number }>();

  const control = (
    <Form.Control
      type="number"
      size={compact ? 'sm' : undefined}
      className={compact ? 'px-1' : undefined}
      style={compact ? { width: '4rem' } : undefined}
      min={min}
      max={max}
      step={step}
      value={
        draft && Math.abs(draft.value - value) < 1e-9
          ? draft.text
          : Number.isFinite(value)
            ? value.toFixed(fractionDigits)
            : ''
      }
      onChange={(e) => {
        const text = e.currentTarget.value;

        const n = Number(text);

        if (text.trim() !== '' && Number.isFinite(n) && n >= min && n <= max) {
          setDraft({ text, value: n });

          onChange(n);
        } else {
          setDraft({ text, value });
        }
      }}
      onBlur={() => setDraft(undefined)}
    />
  );

  return unit ? (
    <InputGroup className="flex-nowrap">
      {control}
      {typeof unit === 'string' ? (
        <InputGroup.Text>{unit}</InputGroup.Text>
      ) : (
        unit
      )}
    </InputGroup>
  ) : (
    control
  );
}

/** The elevation tile's zoom and row at the map's centre, as the layer fetches it. */
function useCentreTile() {
  const zoom = useAppSelector((state) => state.map.zoom);

  const lat = useAppSelector((state) => state.map.lat);

  const dpr = useDevicePixelRatio();

  // A dense screen takes tiles a zoom deeper (`Layers`).
  const z = Math.min(Math.round(zoom) + (dpr > 1.4 ? 1 : 0), 18);

  const rad = (lat * Math.PI) / 180;

  const y = Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** z,
  );

  return { z, y };
}

type RadiusFieldProps = {
  radius: number;
  radiusUnit: RadiusUnit;
  onChange: (radius: number, radiusUnit: RadiusUnit) => void;
};

/** A radius in pixels or ground metres, flagged where metres fall outside the pixels a tile holds. */
function RadiusField({
  radius,
  radiusUnit,
  onChange,
}: RadiusFieldProps): ReactElement {
  const sm = useShadingMessages();

  const { z, y } = useCentreTile();

  const px = radiusUnit === 'm' ? metresToPx(radius, z, y) : radius;

  const drawn = Math.min(Math.max(px, 1), MAX_RADIUS_PX);

  return (
    <NumberField
      min={radiusUnit === 'm' ? 0.1 : 1}
      max={radiusUnit === 'm' ? MAX_RADIUS_M : MAX_RADIUS_PX}
      step={radiusUnit === 'm' ? 0.5 : 1}
      value={radius}
      fractionDigits={radiusUnit === 'm' ? 1 : 0}
      onChange={(value) =>
        onChange(
          radiusUnit === 'm' ? Math.round(value * 10) / 10 : Math.round(value),
          radiusUnit,
        )
      }
      unit={
        <>
          <Form.Select
            className="flex-grow-0 w-auto"
            value={radiusUnit}
            // Switched, it keeps its size at this zoom.
            onChange={(e) => {
              const unit = e.currentTarget.value as RadiusUnit;

              const ground = centreGroundPx(z, y);

              onChange(
                unit === 'm'
                  ? Math.max(Math.round(drawn * ground * 10) / 10, 0.1)
                  : drawn,
                unit,
              );
            }}
          >
            {RADIUS_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Form.Select>

          {px !== drawn && (
            <LongPressTooltip label={sm?.radiusOutOfRange({ px, drawn })}>
              {({ props }) => (
                <InputGroup.Text className="text-warning" {...props}>
                  <FaExclamationTriangle />
                </InputGroup.Text>
              )}
            </LongPressTooltip>
          )}
        </>
      }
    />
  );
}

type Props = {
  shading: Shading;
  component: ShadingComponent;
  onChange: (shading: Shading) => void;
};

export function ShadingComponentParams({
  shading,
  component,
  onChange,
}: Props): ReactElement {
  const sm = useShadingMessages();

  // The last value of a slider drag, committed as one history entry on release.
  const latestRef = useRef<Shading | null>(null);

  const endDragRef = useRef<(() => void) | null>(null);

  function update(change: (c: ShadingComponent) => void) {
    const next = produce(shading, (draft) => {
      const c = draft.components.find((x) => x.id === component.id);

      if (c) {
        change(c);
      }
    });

    if (endDragRef.current) {
      latestRef.current = next;
    }

    onChange(next);
  }

  function patch(key: Param, value: number) {
    update((c) => {
      (c as unknown as Record<Param, number>)[key] = value;
    });
  }

  // Suspend history writes for a slider drag, as the dial does, so the stream
  // of values doesn't flood pushState (Safari caps it at 100/10s).
  function handleSliderPointerDown(e: ReactPointerEvent) {
    if (
      endDragRef.current ||
      !e.isPrimary ||
      e.button !== 0 ||
      !(e.target instanceof HTMLInputElement) ||
      e.target.type !== 'range'
    ) {
      return;
    }

    setUrlUpdatingEnabled(false);

    const { pointerId } = e;

    const end = (e?: PointerEvent) => {
      if (e && e.pointerId !== pointerId) {
        return;
      }

      window.removeEventListener('pointerup', end);

      window.removeEventListener('pointercancel', end);

      endDragRef.current = null;

      // Re-enable first so the flush commits one history entry.
      setUrlUpdatingEnabled(true);

      if (latestRef.current) {
        onChange(latestRef.current);

        latestRef.current = null;
      }
    };

    endDragRef.current = end;

    window.addEventListener('pointerup', end);

    window.addEventListener('pointercancel', end);
  }

  useEffect(() => () => endDragRef.current?.(), []);

  return (
    // As wide as the rest of the panel and never wider.
    <Accordion className="mt-3" style={{ width: 0, minWidth: '100%' }}>
      <Accordion.Item eventKey="params">
        <Accordion.Header>
          <Text m={sm} k="parameters" />
        </Accordion.Header>

        <Accordion.Body className="d-flex flex-column gap-3 p-2">
          {component.type === 'sky-view' && (
            <Form.Group controlId="sky-mode">
              <Form.Label>
                <Text m={sm} k="skyMode" />
              </Form.Label>

              <Form.Select
                value={component.skyMode}
                // Each mode has its own scale, so its own stops.
                onChange={(e) => {
                  const mode = e.currentTarget.value as SkyMode;

                  update((c) => {
                    if (c.type === 'sky-view') {
                      c.skyMode = mode;

                      c.colorStops = skyViewStops(mode);
                    }
                  });
                }}
              >
                {SKY_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {sm?.skyModes[mode]}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          {'exaggeration' in component && (
            <div onPointerDown={handleSliderPointerDown}>
              {/* Logarithmic, so 1 sits in the middle of 0.1–10. */}
              <LabeledSlider
                id="shading-exaggeration"
                label={sm?.exaggeration}
                hint={sm?.exaggerationHint}
                valueLabel={
                  <NumberField
                    compact
                    min={0.1}
                    step={0.1}
                    max={100}
                    value={component.exaggeration}
                    fractionDigits={1}
                    onChange={(value) =>
                      patch('exaggeration', Math.round(value * 10) / 10)
                    }
                  />
                }
                min={-1}
                max={1}
                step={0.01}
                value={
                  component.exaggeration > 0
                    ? Math.log10(component.exaggeration)
                    : -1
                }
                onChange={(value) =>
                  patch('exaggeration', Math.round(10 ** value * 10) / 10)
                }
              />
            </div>
          )}

          {('azimuth' in component || 'elevation' in component) && (
            <div className={ROW}>
              {'azimuth' in component && (
                <Form.Group
                  controlId="azimuth"
                  className={FIELD}
                  style={FIELD_STYLE}
                >
                  <Form.Label>
                    <Text m={sm} k="azimuth" />
                  </Form.Label>

                  <NumberField
                    min={0}
                    max={360}
                    step={5}
                    value={(component.azimuth / Math.PI) * 180}
                    fractionDigits={1}
                    unit="°"
                    onChange={(value) =>
                      patch('azimuth', (value / 180) * Math.PI)
                    }
                  />
                </Form.Group>
              )}

              {'elevation' in component && (
                <Form.Group
                  controlId="elevation"
                  className={FIELD}
                  style={FIELD_STYLE}
                >
                  <Form.Label>
                    <Text m={sm} k="lightElevation" />
                  </Form.Label>

                  <NumberField
                    min={0}
                    max={90}
                    value={(component.elevation / Math.PI) * 180}
                    fractionDigits={1}
                    unit="°"
                    onChange={(value) =>
                      patch('elevation', (value / 180) * Math.PI)
                    }
                  />
                </Form.Group>
              )}
            </div>
          )}

          {'radius' in component && (
            <Form.Group controlId="shading-radius">
              <Form.Label>
                <Text m={sm} k="radius" />
              </Form.Label>

              <RadiusField
                radius={component.radius}
                radiusUnit={component.radiusUnit}
                onChange={(radius, radiusUnit) =>
                  update((c) => {
                    if ('radius' in c) {
                      c.radius = radius;

                      c.radiusUnit = radiusUnit;
                    }
                  })
                }
              />
            </Form.Group>
          )}

          {component.type === 'contours' && (
            <div className={ROW}>
              <Form.Group
                controlId="contour-interval"
                className={FIELD}
                style={FIELD_STYLE}
              >
                <Form.Label>
                  <Text m={sm} k="contourInterval" />
                </Form.Label>

                <NumberField
                  min={0.5}
                  max={10000}
                  step={0.5}
                  value={component.interval}
                  fractionDigits={1}
                  unit="m"
                  // To what the link keeps, so server tiles draw the same lines.
                  onChange={(value) =>
                    patch('interval', Math.round(value * 10) / 10)
                  }
                />
              </Form.Group>

              <Form.Group
                controlId="contour-line-width"
                className={FIELD}
                style={FIELD_STYLE}
              >
                <Form.Label>
                  <Text m={sm} k="lineWidth" />
                </Form.Label>

                <NumberField
                  min={0.25}
                  max={20}
                  step={0.25}
                  value={component.lineWidth}
                  fractionDigits={2}
                  unit="px"
                  onChange={(value) =>
                    patch('lineWidth', Math.round(value * 100) / 100)
                  }
                />
              </Form.Group>
            </div>
          )}

          <div onPointerDown={handleSliderPointerDown}>
            <LabeledSlider
              id="shading-contrast"
              label={sm?.contrast}
              valueLabel={
                <NumberField
                  compact
                  min={0}
                  max={10}
                  step={0.05}
                  value={component.contrast}
                  fractionDigits={2}
                  onChange={(value) => patch('contrast', value)}
                />
              }
              min={0}
              max={3}
              step={0.05}
              value={component.contrast}
              onChange={(value) => patch('contrast', value)}
            />
          </div>

          <div onPointerDown={handleSliderPointerDown}>
            <LabeledSlider
              id="shading-brightness"
              label={sm?.brightness}
              valueLabel={
                <NumberField
                  compact
                  min={-1}
                  max={1}
                  step={0.01}
                  value={component.brightness}
                  fractionDigits={2}
                  onChange={(value) => patch('brightness', value)}
                />
              }
              min={-1}
              max={1}
              step={0.01}
              value={component.brightness}
              onChange={(value) => patch('brightness', value)}
            />
          </div>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}
