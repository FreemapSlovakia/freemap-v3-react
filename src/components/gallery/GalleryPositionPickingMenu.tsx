import React, { ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Panel from 'react-bootstrap/lib/Panel';

import {
  gallerySetItemForPositionPicking,
  galleryConfirmPickedPosition,
} from 'fm3/actions/galleryActions';

import Button from 'react-bootstrap/lib/Button';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { useTranslator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';

export function GalleryPositionPickingMenu(): ReactElement | null {
  const t = useTranslator();

  const dispatch = useDispatch();

  const pickingPosition = useSelector(
    (state: RootState) => state.gallery.pickingPositionForId !== null,
  );

  return !pickingPosition ? null : (
    <Panel className="fm-toolbar">
      {t('gallery.locationPicking.title')}{' '}
      <Button
        onClick={() => {
          dispatch(galleryConfirmPickedPosition());
        }}
      >
        <FontAwesomeIcon icon="check" />
        <span className="hidden-xs"> {t('general.ok')}</span>
      </Button>{' '}
      <Button
        onClick={() => {
          dispatch(gallerySetItemForPositionPicking(null));
        }}
      >
        <FontAwesomeIcon icon="times" />
        <span className="hidden-xs"> {t('general.cancel')}</span> <kbd>Esc</kbd>
      </Button>
    </Panel>
  );
}
