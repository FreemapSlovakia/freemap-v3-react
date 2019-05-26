import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import Button from 'react-bootstrap/lib/Button';

import { infoPointAdd, infoPointDelete } from 'fm3/actions/infoPointActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';
import injectL10n from 'fm3/l10nInjector';

function InfoPointMenu({ onInfoPointAdd, onLabelModify, isActive, onDelete, t }) {
  const handleInfoPointAdd = useCallback((lat, lon) => {
    onInfoPointAdd(lat, lon);
  }, [onInfoPointAdd]);

  useEffect(() => {
    mapEventEmitter.on('mapClick', handleInfoPointAdd);
    return () => {
      mapEventEmitter.removeListener('mapClick', handleInfoPointAdd);
    };
  }, [handleInfoPointAdd]);

  return (
    <>
      <span className="fm-label">
        <FontAwesomeIcon icon="thumb-tack" />
        <span className="hidden-xs"> {t('tools.infoPoint')}</span>
      </span>
      {' '}
      <Button onClick={onLabelModify} disabled={!isActive}>
        <FontAwesomeIcon icon="tag" />
        <span className="hidden-xs"> {t('infoPoint.modify')}</span>
      </Button>
      {' '}
      <Button onClick={onDelete} disabled={!isActive}>
        <FontAwesomeIcon icon="trash-o" />
        <span className="hidden-xs"> {t('general.delete')}</span>
      </Button>
    </>
  );
}

InfoPointMenu.propTypes = {
  onLabelModify: PropTypes.func.isRequired,
  onInfoPointAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isActive: PropTypes.bool,
  t: PropTypes.func.isRequired,
};

export default compose(
  injectL10n(),
  connect(
    state => ({
      isActive: state.infoPoint.activeIndex !== null,
    }),
    dispatch => ({
      onInfoPointAdd(lat, lon) {
        dispatch(infoPointAdd(lat, lon, ''));
      },
      onLabelModify() {
        dispatch(setActiveModal('info-point-change-label'));
      },
      onDelete() {
        dispatch(infoPointDelete());
      },
    }),
  ),
)(InfoPointMenu);
