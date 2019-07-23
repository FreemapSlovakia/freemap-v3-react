import React from 'react';
import { connect } from 'react-redux';
import { compose, Dispatch } from 'redux';
import Panel from 'react-bootstrap/lib/Panel';

import {
  gallerySetItemForPositionPicking,
  galleryConfirmPickedPosition,
} from 'fm3/actions/galleryActions';

import Button from 'react-bootstrap/lib/Button';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const GalleryPositionPickingMenu: React.FC<Props> = ({
  pickingPosition,
  onPositionConfirm,
  onPositionCancel,
  t,
}) => {
  if (!pickingPosition) {
    return null;
  }

  return (
    <Panel className="fm-toolbar">
      {t('gallery.locationPicking.title')}{' '}
      <Button onClick={onPositionConfirm}>
        <FontAwesomeIcon icon="check" />
        <span className="hidden-xs"> {t('general.ok')}</span>
      </Button>{' '}
      <Button onClick={onPositionCancel}>
        <FontAwesomeIcon icon="times" />
        <span className="hidden-xs"> {t('general.cancel')}</span>
      </Button>
    </Panel>
  );
};

const mapStateToProps = (state: RootState) => ({
  pickingPosition: state.gallery.pickingPositionForId !== null,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onPositionConfirm() {
    dispatch(galleryConfirmPickedPosition());
  },
  onPositionCancel() {
    dispatch(gallerySetItemForPositionPicking(null));
  },
});

export default compose(
  withTranslator,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(GalleryPositionPickingMenu);
