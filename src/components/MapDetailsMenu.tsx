import React, { useEffect, ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import Button from 'react-bootstrap/lib/Button';

import {
  mapDetailsSetSubtool,
  mapDetailsSetUserSelectedPosition,
} from 'fm3/actions/mapDetailsActions';
import { mapEventEmitter } from 'fm3/mapEventEmitter';

import { useTranslator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';

export function MapDetailsMenu(): ReactElement {
  const t = useTranslator();

  const dispatch = useDispatch();

  const subtool = useSelector((state: RootState) => state.mapDetails.subtool);

  useEffect(() => {
    function setUserSelectedPosition(lat: number, lon: number) {
      if (subtool !== null) {
        dispatch(mapDetailsSetUserSelectedPosition({ lat, lon }));
      }
    }

    mapEventEmitter.on('mapClick', setUserSelectedPosition);

    return () => {
      mapEventEmitter.removeListener('mapClick', setUserSelectedPosition);
    };
  }, [dispatch, subtool]);

  return (
    <Button
      onClick={() => {
        dispatch(mapDetailsSetSubtool('track-info'));
      }}
      active={subtool === 'track-info'}
      title={t('mapDetails.road')}
    >
      <FontAwesomeIcon icon="road" />
      <span className="hidden-xs"> {t('mapDetails.road')}</span>
    </Button>
  );
}
