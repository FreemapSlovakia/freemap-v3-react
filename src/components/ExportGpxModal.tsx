import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import Alert from 'react-bootstrap/lib/Alert';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { setActiveModal, exportGpx } from 'fm3/actions/mainActions';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';

const exportableDefinitions = [
  // { type: 'search', icon: 'search', name: 'výsledok hľadania' },
  { type: 'plannedRoute', icon: 'map-signs' },
  { type: 'plannedRouteWithStops', icon: 'map-signs' },
  { type: 'objects', icon: 'map-marker' },
  { type: 'pictures', icon: 'picture-o' },
  { type: 'distanceMeasurement', icon: 'arrows-h' },
  { type: 'areaMeasurement', icon: 'square' },
  { type: 'elevationMeasurement', icon: 'long-arrow-up' },
  { type: 'infoPoint', icon: 'thumb-tack' },
  { type: 'tracking', icon: 'bullseye' },
  { type: 'gpx', icon: 'road' },
  // { type: 'changesets', icon: 'pencil', name: 'zmeny v mape' },
  // { type: 'mapDetils', icon: 'info', name: 'detaily v mape' },
] as const;

type GetKeys<T extends readonly { type: any }[]> = T[number]['type'];

export type Exportables = GetKeys<typeof exportableDefinitions>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const ExportGpxModal: React.FC<Props> = ({
  onModalClose,
  exportables: initExportables,
  t,
  onExport,
}) => {
  const [exportables, setExportables] = useState<string[] | undefined>();

  useEffect(() => {
    setExportables(initExportables);
    // eslint-disable-next-line
  }, []);

  const handleExportClick = useCallback(() => {
    if (exportables) {
      onExport(exportables);
    }
  }, [onExport, exportables]);

  const handleCheckboxChange = useCallback(
    (type: string) => {
      if (!exportables) {
        return;
      }

      const set = new Set(exportables);
      if (exportables.includes(type)) {
        set.delete(type);
      } else {
        set.add(type);
      }
      setExportables([...set]);
    },
    [exportables],
  );

  if (!exportables) {
    return null;
  }

  return (
    <Modal show onHide={onModalClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="share" /> {t('more.gpxExport')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert bsStyle="warning">{t('gpxExport.disabledAlert')}</Alert>
        {exportableDefinitions.map(({ type, icon }) => (
          <Checkbox
            key={type}
            checked={exportables.includes(type)}
            disabled={!initExportables.includes(type)}
            onChange={() => handleCheckboxChange(type)}
          >
            {t('gpxExport.export')} <FontAwesomeIcon icon={icon} />{' '}
            {t(`gpxExport.what.${type}`)}
          </Checkbox>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleExportClick} disabled={!exportables.length}>
          <FontAwesomeIcon icon="share" /> {t('gpxExport.export')}
        </Button>{' '}
        <Button onClick={onModalClose}>
          <Glyphicon glyph="remove" /> {t('general.close')} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const mapStateToProps = (state: RootState) => {
  const exportables: string[] = [];

  if (state.search.selectedResult) {
    // exportables.push('search');
  }

  if (state.routePlanner.alternatives.length) {
    exportables.push('plannedRoute');
    exportables.push('plannedRouteWithStops');
  }

  if (state.objects.objects.length) {
    exportables.push('objects');
  }

  if (state.map.overlays.includes('I')) {
    exportables.push('pictures');
  }

  if (state.areaMeasurement.points.length) {
    exportables.push('areaMeasurement');
  }

  if (state.distanceMeasurement.points.length) {
    exportables.push('distanceMeasurement');
  }

  if (state.elevationMeasurement.point) {
    exportables.push('elevationMeasurement');
  }

  if (state.infoPoint.points.length) {
    exportables.push('infoPoint');
  }

  if (state.tracking.tracks.length) {
    exportables.push('tracking');
  }

  if (state.trackViewer.trackGpx) {
    exportables.push('gpx');
  }

  if (state.changesets.changesets.length) {
    // exportables.push('changesets');
  }

  if (state.mapDetails.trackInfoPoints) {
    // exportables.push('mapDetails');
  }

  return {
    exportables,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onModalClose() {
    dispatch(setActiveModal(null));
  },
  onExport(exportables: string[] | null) {
    if (exportables) {
      dispatch(exportGpx(exportables));
    }
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(ExportGpxModal));
