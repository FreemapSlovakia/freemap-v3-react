import { Text } from '@features/l10n/Text.js';
import Color from 'color';
import type { ReactElement } from 'react';
import { ListGroup } from 'react-bootstrap';
import {
  type Shading,
  type ShadingComponent,
  swatchColor,
} from '../model/Shading.js';
import { useShadingMessages } from '../translations/useShadingMessages.js';
import classes from './ShadingControl.module.css';

/**
 * A layer's colours: its one colour, its stops left to right, or aspect's
 * round the compass.
 */
function swatchBackground({ type, colorStops }: ShadingComponent) {
  if (colorStops.length < 2) {
    return Color(swatchColor(colorStops)).hexa();
  }

  const values = colorStops.map((s) => s.value);

  const [min, max] =
    type === 'aspect'
      ? [0, 2 * Math.PI]
      : [Math.min(...values), Math.max(...values)];

  const at = (v: number) =>
    max > min ? (((v - min) / (max - min)) * 100).toFixed(1) : '0';

  const stops = colorStops
    .map((s) => `${Color(s.color).hexa()} ${at(s.value)}%`)
    .join(', ');

  return type === 'aspect'
    ? `conic-gradient(${stops})`
    : `linear-gradient(90deg, ${stops})`;
}

type Props = {
  shading: Shading;
  /** An overlay's background is optional and not listed while there is none. */
  showBackground: boolean;
  selectedId?: number;
  onSelect: (id?: number) => void;
};

export function ShadingComponentList({
  shading,
  showBackground,
  selectedId,
  onSelect,
}: Props): ReactElement {
  const sm = useShadingMessages();

  return (
    <ListGroup
      className={`my-2 ${classes.list}`}
      activeKey={selectedId ?? ''}
      onSelect={(e) => onSelect(e ? Number(e) : undefined)}
    >
      {showBackground && (
        <ListGroup.Item action eventKey="">
          <span
            className={`rounded border ${classes.shadingColor}`}
            style={{ backgroundColor: Color(shading.backgroundColor).hexa() }}
          />
          <span>
            <Text m={sm} k="background" />
          </span>
        </ListGroup.Item>
      )}

      {shading.components.map((component) => (
        <ListGroup.Item action key={component.id} eventKey={component.id}>
          <span
            className={`rounded border ${classes.shadingColor}`}
            style={{ background: swatchBackground(component) }}
          />
          <span>
            <Text m={sm} k={`types.${component.type}`} />
          </span>
          <small>
            {(component.type === 'hillshade-classic' ||
              component.type === 'hillshade-igor') &&
              `∠ ${(component.azimuth * (180 / Math.PI)).toFixed(1)}`}
            {(component.type === 'hillshade-classic' ||
              component.type === 'slope-classic') &&
              ` ↥ ${(component.elevation * (180 / Math.PI)).toFixed(1)}`}
          </small>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}
