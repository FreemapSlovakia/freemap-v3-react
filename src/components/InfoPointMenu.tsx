import React, { useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import Button from 'react-bootstrap/lib/Button';

import { infoPointAdd, infoPointDelete } from 'fm3/actions/infoPointActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import { mapEventEmitter } from 'fm3/mapEventEmitter';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const InfoPointMenuInt: React.FC<Props> = ({
  onInfoPointAdd,
  onLabelModify,
  isActive,
  onDelete,
  t,
}) => {
  const handleInfoPointAdd = useCallback(
    (lat: number, lon: number) => {
      onInfoPointAdd(lat, lon);
    },
    [onInfoPointAdd],
  );

  useEffect(() => {
    mapEventEmitter.on('mapClick', handleInfoPointAdd);
    return () => {
      mapEventEmitter.removeListener('mapClick', handleInfoPointAdd);
    };
  }, [handleInfoPointAdd]);

  return (
    <>
      <Button onClick={onLabelModify} disabled={!isActive}>
        <FontAwesomeIcon icon="tag" />
        <span className="hidden-xs"> {t('infoPoint.modify')}</span>
      </Button>{' '}
      <Button onClick={onDelete} disabled={!isActive}>
        <FontAwesomeIcon icon="trash-o" />
        <span className="hidden-xs"> {t('general.delete')}</span>
      </Button>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  isActive: state.infoPoint.activeIndex !== null,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onInfoPointAdd(lat: number, lon: number) {
    dispatch(infoPointAdd({ lat, lon, label: '' }));
  },
  onLabelModify() {
    dispatch(setActiveModal('info-point-change-label'));
  },
  onDelete() {
    dispatch(infoPointDelete());
  },
});

export const InfoPointMenu = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(InfoPointMenuInt));
