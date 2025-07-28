import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  galleryConfirmPickedPosition,
  gallerySetItemForPositionPicking,
} from '../../actions/galleryActions.js';
import { LongPressTooltip } from '../../components/LongPressTooltip.js';
import { useMessages } from '../../l10nInjector.js';
import { Toolbar } from '../Toolbar.js';

export default GalleryPositionPickingMenu;

export function GalleryPositionPickingMenu(): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  return (
    <div>
      <Toolbar className="mt-2">
        <div className="m-2">{m?.gallery.locationPicking.title}</div>

        <LongPressTooltip breakpoint="sm" label={m?.general.ok}>
          {({ label, labelClassName, props }) => (
            <Button
              className="me-1"
              onClick={() => dispatch(galleryConfirmPickedPosition())}
              {...props}
            >
              <FaCheck />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>

        <LongPressTooltip breakpoint="sm" label={m?.general.cancel} kbd="Esc">
          {({ label, labelClassName, props }) => (
            <Button
              onClick={() => dispatch(gallerySetItemForPositionPicking(null))}
              {...props}
            >
              <FaTimes />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>
      </Toolbar>
    </div>
  );
}
