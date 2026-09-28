import type { ReactElement } from 'react';
import { Form, OverlayTrigger, Popover } from 'react-bootstrap';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';
import classes from './OpacityButton.module.css';

type Props = {
  /** 0 to 1. */
  value: number;
  onChange: (value: number) => void;
};

/** A swatch as opaque as the layer, opening a slider for it. */
export function OpacityButton({ value, onChange }: Props): ReactElement {
  const msm = useMapSettingsMessages();

  return (
    <OverlayTrigger
      trigger="click"
      placement="left"
      rootClose
      overlay={
        <Popover>
          <Popover.Header as="h3">{msm?.overlayOpacity}</Popover.Header>

          <Popover.Body>
            <Form.Range
              min={0}
              max={100}
              value={Math.round(value * 100)}
              onChange={(e) => onChange(Number(e.currentTarget.value) / 100)}
            />
          </Popover.Body>
        </Popover>
      }
    >
      <div className={classes.opacityButton}>
        <button type="button" style={{ opacity: value }} />
      </div>
    </OverlayTrigger>
  );
}
