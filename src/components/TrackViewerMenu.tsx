import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import Button from 'react-bootstrap/lib/Button';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';

import { withTranslator, Translator } from 'fm3/l10nInjector';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';

import {
  setActiveModal,
  clearMap,
  convertToDrawing,
} from 'fm3/actions/mainActions';
import {
  trackViewerUploadTrack,
  trackViewerColorizeTrackBy,
  trackViewerToggleElevationChart,
  ColorizingMode,
  trackViewerSetData,
} from 'fm3/actions/trackViewerActions';

import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';
import { TrackViewerDetails } from './TrackViewerDetails';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { getType } from 'typesafe-actions';

import 'fm3/styles/trackViewer.scss';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const TrackViewerMenuInt: React.FC<Props> = ({
  onServerUpload,
  onUpload,
  hasTrack,
  elevationChartActive,
  colorizeTrackBy,
  onColorizeTrackBy,
  onShowTrackInfo,
  trackGeojsonIsSuitableForElevationChart,
  onToggleElevationChart,
  onConvertToDrawing,
  t,
}) => {
  const handleConvertToDrawing = useCallback(() => {
    const tolerance = window.prompt(t('general.simplifyPrompt'), '50');

    if (tolerance !== null) {
      onConvertToDrawing(Number(tolerance));
    }
  }, [onConvertToDrawing, t]);

  return (
    <>
      <Button onClick={() => onUpload()}>
        <FontAwesomeIcon icon="upload" />
        <span className="hidden-xs"> {t('trackViewer.upload')}</span>
      </Button>{' '}
      <Button
        active={elevationChartActive}
        onClick={onToggleElevationChart}
        disabled={!trackGeojsonIsSuitableForElevationChart}
      >
        <FontAwesomeIcon icon="bar-chart" />
        <span className="hidden-xs"> {t('general.elevationProfile')}</span>
      </Button>{' '}
      <DropdownButton
        id="colorizing_mode"
        onSelect={onColorizeTrackBy}
        title={
          <>
            <FontAwesomeIcon icon="paint-brush" />{' '}
            {t(`trackViewer.colorizingMode.${colorizeTrackBy || 'none'}`)}
          </>
        }
      >
        {([null, 'elevation', 'steepness'] as const).map((mode) => (
          <MenuItem
            eventKey={mode}
            key={mode || 'none'}
            active={mode === colorizeTrackBy}
          >
            {t(`trackViewer.colorizingMode.${mode || 'none'}`)}
          </MenuItem>
        ))}
      </DropdownButton>{' '}
      <Button
        onClick={onShowTrackInfo}
        disabled={!trackGeojsonIsSuitableForElevationChart}
      >
        <FontAwesomeIcon icon="info-circle" />
        <span className="hidden-xs"> {t('trackViewer.moreInfo')}</span>
      </Button>{' '}
      <Button onClick={onServerUpload} disabled={!hasTrack}>
        <FontAwesomeIcon icon="cloud-upload" />
        <span className="hidden-xs"> {t('trackViewer.share')}</span>
      </Button>{' '}
      <Button
        onClick={handleConvertToDrawing}
        disabled={!hasTrack}
        title={t('general.convertToDrawing')}
      >
        <FontAwesomeIcon icon="pencil" />
        <span className="hidden-xs"> {t('general.convertToDrawing')}</span>
      </Button>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  hasTrack: !!state.trackViewer.trackGeojson,
  elevationChartActive: !!state.elevationChart.trackGeojson,
  colorizeTrackBy: state.trackViewer.colorizeTrackBy,
  trackGeojsonIsSuitableForElevationChart: isSuitableForElevationChart(state),
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onUpload() {
    dispatch(setActiveModal('upload-track'));
  },
  onServerUpload() {
    dispatch(trackViewerUploadTrack());
  },
  onColorizeTrackBy(approach: any) {
    dispatch(trackViewerColorizeTrackBy(approach as ColorizingMode | null));
  },
  onShowTrackInfo() {
    dispatch(
      toastsAdd({
        collapseKey: 'trackViewer.trackInfo',
        message: <TrackViewerDetails />, // TODO only string
        cancelType: [getType(clearMap), getType(trackViewerSetData)],
        style: 'info',
      }),
    );
  },
  onToggleElevationChart() {
    dispatch(trackViewerToggleElevationChart());
  },
  onConvertToDrawing(tolerance: number | undefined) {
    dispatch(convertToDrawing(tolerance));
  },
});

export const TrackViewerMenu = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(TrackViewerMenuInt));

function isSuitableForElevationChart(state: RootState) {
  const { trackGeojson } = state.trackViewer;
  if (trackGeojson && trackGeojson.features) {
    const firstGeojsonFeature = trackGeojson.features[0];
    return (
      firstGeojsonFeature && firstGeojsonFeature.geometry.type === 'LineString'
    );
  }

  return false;
}
