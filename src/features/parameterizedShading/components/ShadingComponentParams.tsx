import { produce } from 'immer';
import { ReactElement } from 'react';
import { Form } from 'react-bootstrap';
import { Shading, ShadingComponent } from '../model/Shading.js';
import { useShadingMessages } from '../translations/useShadingMessages.js';

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

  return (
    <>
      {'exaggeration' in component && (
        <Form.Group controlId="exaggeration" className="mt-3">
          <Form.Label>{sm?.exaggeration}</Form.Label>

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

      {(component.type === 'hillshade-igor' ||
        component.type === 'hillshade-classic') && (
        <Form.Group controlId="azimuth" className="mt-3">
          <Form.Label>{sm?.azimuth}</Form.Label>

          <Form.Control
            type="number"
            min={0}
            max={360}
            step={5}
            value={((component.azimuth / Math.PI) * 180).toFixed(1)}
            onChange={(e) =>
              patch('azimuth', (Number(e.currentTarget.value) / 180) * Math.PI)
            }
          />
        </Form.Group>
      )}

      {(component.type === 'hillshade-classic' ||
        component.type === 'slope-classic') && (
        <Form.Group controlId="elevation" className="mt-3">
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
    </>
  );
}
