import Color from 'color';
import { ReactElement } from 'react';
import { ListGroup } from 'react-bootstrap';
import { Shading } from '../model/Shading.js';
import { useShadingMessages } from '../translations/useShadingMessages.js';
import classes from './ShadingControl.module.css';

type Props = {
  shading: Shading;
  selectedId?: number;
  onSelect: (id?: number) => void;
};

export function ShadingComponentList({
  shading,
  selectedId,
  onSelect,
}: Props): ReactElement {
  const sm = useShadingMessages();

  return (
    <ListGroup
      className="my-2"
      activeKey={selectedId ?? ''}
      onSelect={(e) => onSelect(e ? Number(e) : undefined)}
    >
      <ListGroup.Item action eventKey="">
        <span
          className={classes.shadingColor}
          style={{ backgroundColor: Color(shading.backgroundColor).hexa() }}
        />{' '}
        {sm?.background}
      </ListGroup.Item>

      {shading.components.map((component) => (
        <ListGroup.Item
          action
          key={component.id}
          eventKey={component.id}
          className="fm-ellipsis"
        >
          {/^hillshade-|^slope-/.test(component.type) && (
            <span
              className={classes.shadingColor}
              style={{
                backgroundColor: Color(component.colorStops[0].color).hexa(),
              }}
            />
          )}{' '}
          {sm?.types[component.type]}
          {(component.type === 'hillshade-classic' ||
            component.type === 'hillshade-igor') &&
            ' ◯ ' + (component.azimuth * (180 / Math.PI)).toFixed(1)}
          {(component.type === 'hillshade-classic' ||
            component.type === 'slope-classic') &&
            ' ↥ ' + (component.elevation * (180 / Math.PI)).toFixed(1)}
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}
