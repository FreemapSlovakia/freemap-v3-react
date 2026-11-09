import { PickingMenu } from '@shared/components/PickingMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { type ReactElement, useId, useRef } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  galleryConfirmPickedPosition,
  gallerySetItemForPositionPicking,
  gallerySetPickingAzimuth,
  gallerySetPickingPosition,
} from '../model/actions.js';
import { useGalleryMessages } from '../translations/useGalleryMessages.js';
import { Azimuth } from './Azimuth.js';
import classes from './GalleryPositionPickingMenu.module.css';

export default function GalleryPositionPickingMenu(): ReactElement {
  const gm = useGalleryMessages();

  const dispatch = useDispatch();

  const azimuth = useAppSelector((state) => state.gallery.pickingAzimuth);

  const inputId = useId();

  const tracked = useRef(false);

  const setAzimuth = (value: number | null) => {
    if (!tracked.current) {
      tracked.current = true;

      trackMatomo(['trackEvent', 'Gallery', 'pickAzimuth']);
    }

    dispatch(gallerySetPickingAzimuth(value));
  };

  return (
    <PickingMenu
      prompt={gm?.locationPicking.title}
      onConfirm={() => dispatch(galleryConfirmPickedPosition())}
      onCancel={() => dispatch(gallerySetItemForPositionPicking(null))}
      onPlace={(position) => dispatch(gallerySetPickingPosition(position))}
      cancelKbd="Esc"
    >
      <div className="vr align-self-stretch mx-1" />

      <label htmlFor={inputId} className="align-self-center">
        {gm?.editForm.azimuth}
      </label>

      <InputGroup className="w-auto flex-nowrap">
        <Form.Control
          id={inputId}
          className={classes.azimuth}
          type="number"
          value={azimuth ?? ''}
          onChange={(e) => {
            const value = parseFloat(e.currentTarget.value);

            setAzimuth(Number.isNaN(value) ? null : value);
          }}
          min={0}
          max={360}
          step="any"
        />

        <InputGroup.Text>°</InputGroup.Text>
      </InputGroup>

      <Azimuth
        className="align-self-center flex-shrink-0"
        value={azimuth}
        size={34}
        onChange={(value) => setAzimuth(Math.round(value * 10) / 10)}
      />

      <div className="vr align-self-stretch mx-1" />
    </PickingMenu>
  );
}
