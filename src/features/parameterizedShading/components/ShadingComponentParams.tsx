import { HintMark } from '@shared/components/HintMark.js';
import { produce } from 'immer';
import type { ReactElement } from 'react';
import { Form } from 'react-bootstrap';
import type { Shading, ShadingComponent } from '../model/Shading.js';
import { useShadingMessages } from '../translations/useShadingMessages.js';

// A label may wrap onto a second line, so the input keeps to the bottom.
const FIELD = 'd-flex flex-column justify-content-end';

// An equal share, but never narrower than a value such as 315.5 needs.
const FIELD_STYLE = { flex: '1 1 5.5rem', minWidth: '5.5rem' };

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

  function patch(key: 'exaggeration' | 'azimuth' | 'elevation', value: number) {
    onChange(
      produce(shading, (draft) => {
        const c = draft.components.find((x) => x.id === component.id) as
          | Record<'exaggeration' | 'azimuth' | 'elevation', number>
          | undefined;

        if (c) {
          c[key] = value;
        }
      }),
    );
  }

  const hasAzimuth =
    component.type === 'hillshade-igor' ||
    component.type === 'hillshade-classic';

  const hasElevation =
    component.type === 'hillshade-classic' ||
    component.type === 'slope-classic';

  return (
    <>
      {'exaggeration' in component && (
        <Form.Group controlId="exaggeration" className="mt-3">
          <Form.Label>
            {sm?.exaggeration}
            <HintMark hint={sm?.exaggerationHint} />
          </Form.Label>

          <Form.Control
            type="number"
            min={0.1}
            step={0.1}
            max={100}
            value={component.exaggeration.toFixed(1)}
            onChange={(e) =>
              patch('exaggeration', Number(e.currentTarget.value))
            }
          />
        </Form.Group>
      )}

      {(hasAzimuth || hasElevation) && (
        // The light's direction, side by side, as wide as the rest of the panel
        // and never wider; a field too narrow for its value moves to the next
        // line instead.
        <div
          className="d-flex flex-wrap gap-2 mt-3"
          style={{ width: 0, minWidth: '100%' }}
        >
          {(component.type === 'hillshade-igor' ||
            component.type === 'hillshade-classic') && (
            <Form.Group
              controlId="azimuth"
              className={FIELD}
              style={FIELD_STYLE}
            >
              <Form.Label>{sm?.azimuth}</Form.Label>

              <Form.Control
                type="number"
                min={0}
                max={360}
                step={5}
                value={((component.azimuth / Math.PI) * 180).toFixed(1)}
                onChange={(e) =>
                  patch(
                    'azimuth',
                    (Number(e.currentTarget.value) / 180) * Math.PI,
                  )
                }
              />
            </Form.Group>
          )}

          {(component.type === 'hillshade-classic' ||
            component.type === 'slope-classic') && (
            <Form.Group
              controlId="elevation"
              className={FIELD}
              style={FIELD_STYLE}
            >
              <Form.Label>{sm?.lightElevation}</Form.Label>

              <Form.Control
                type="number"
                min={0}
                max={90}
                value={((component.elevation / Math.PI) * 180).toFixed(1)}
                onChange={(e) =>
                  patch(
                    'elevation',
                    (Number(e.currentTarget.value) / 180) * Math.PI,
                  )
                }
              />
            </Form.Group>
          )}
        </div>
      )}
    </>
  );
}
