import { setUrlUpdatingEnabled } from '@app/url/urlUpdating.js';
import { LabeledSlider } from '@shared/components/LabeledSlider.js';
import { produce } from 'immer';
import {
  type ReactElement,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Accordion, Form } from 'react-bootstrap';
import type { Shading, ShadingComponent } from '../model/Shading.js';
import { useShadingMessages } from '../translations/useShadingMessages.js';

type Param =
  | 'exaggeration'
  | 'azimuth'
  | 'elevation'
  | 'contrast'
  | 'brightness';

// A label may wrap onto a second line, so the input keeps to the bottom.
const FIELD = 'd-flex flex-column justify-content-end';

// An equal share, but never narrower than a value such as 315.5 needs.
const FIELD_STYLE = { flex: '1 1 5.5rem', minWidth: '5.5rem' };

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
  onChange,
}: NumberFieldProps): ReactElement {
  const [draft, setDraft] = useState<{ text: string; value: number }>();

  return (
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

  function patch(key: Param, value: number) {
    const next = produce(shading, (draft) => {
      const c = draft.components.find((x) => x.id === component.id) as
        | Record<Param, number>
        | undefined;

      if (c) {
        c[key] = value;
      }
    });

    if (endDragRef.current) {
      latestRef.current = next;
    }

    onChange(next);
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
        <Accordion.Header>{sm?.parameters}</Accordion.Header>

        <Accordion.Body className="d-flex flex-column gap-3 p-2">
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
                    onChange={(value) => patch('exaggeration', value)}
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
                  <Form.Label>{sm?.azimuth}</Form.Label>

                  <NumberField
                    min={0}
                    max={360}
                    step={5}
                    value={(component.azimuth / Math.PI) * 180}
                    fractionDigits={1}
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
                  <Form.Label>{sm?.lightElevation}</Form.Label>

                  <NumberField
                    min={0}
                    max={90}
                    value={(component.elevation / Math.PI) * 180}
                    fractionDigits={1}
                    onChange={(value) =>
                      patch('elevation', (value / 180) * Math.PI)
                    }
                  />
                </Form.Group>
              )}
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
