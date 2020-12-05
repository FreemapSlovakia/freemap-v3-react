import React, { ReactElement, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from 'react-bootstrap/lib/Button';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';

import { useMessages } from 'fm3/l10nInjector';

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
import { toastsAdd } from 'fm3/actions/toastsActions';
import { getType } from 'typesafe-actions';

import 'fm3/styles/trackViewer.scss';
import { assertType } from 'typescript-is';

export function TrackViewerMenu(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const hasTrack = useSelector(
    (state: RootState) => !!state.trackViewer.trackGeojson,
  );

  const elevationChartActive = useSelector(
    (state: RootState) => !!state.elevationChart.trackGeojson,
  );

  const colorizeTrackBy = useSelector(
    (state: RootState) => state.trackViewer.colorizeTrackBy,
  );

  const trackGeojsonIsSuitableForElevationChart = useSelector(
    (state: RootState) => isSuitableForElevationChart(state),
  );

  const handleConvertToDrawing = useCallback(() => {
    const tolerance = window.prompt(m?.general.simplifyPrompt, '50');

    if (tolerance !== null) {
      dispatch(convertToDrawing(Number(tolerance)));
    }
  }, [dispatch, m]);

  return (
    <>
      <Button
        onClick={() => {
          dispatch(setActiveModal('upload-track'));
        }}
      >
        <FontAwesomeIcon icon="upload" />
        <span className="hidden-xs"> {m?.trackViewer.upload}</span>
      </Button>{' '}
      <Button
        active={elevationChartActive}
        onClick={() => {
          dispatch(trackViewerToggleElevationChart());
        }}
        disabled={!trackGeojsonIsSuitableForElevationChart}
      >
        <FontAwesomeIcon icon="bar-chart" />
        <span className="hidden-xs"> {m?.general.elevationProfile}</span>
      </Button>{' '}
      <DropdownButton
        id="colorizing_mode"
        onSelect={(approach: unknown) => {
          dispatch(
            trackViewerColorizeTrackBy(
              assertType<ColorizingMode | null>(approach),
            ),
          );
        }}
        title={
          <>
            <FontAwesomeIcon icon="paint-brush" />{' '}
            {m?.trackViewer.colorizingMode[colorizeTrackBy ?? 'none']}
          </>
        }
      >
        {([null, 'elevation', 'steepness'] as const).map((mode) => (
          <MenuItem
            eventKey={mode}
            key={mode || 'none'}
            active={mode === colorizeTrackBy}
          >
            {m?.trackViewer.colorizingMode[mode ?? 'none']}
          </MenuItem>
        ))}
      </DropdownButton>{' '}
      <Button
        onClick={() => {
          dispatch(
            toastsAdd({
              id: 'trackViewer.trackInfo',
              messageKey: 'trackViewer.info',
              cancelType: [getType(clearMap), getType(trackViewerSetData)],
              style: 'info',
            }),
          );
        }}
        disabled={!trackGeojsonIsSuitableForElevationChart}
      >
        <FontAwesomeIcon icon="info-circle" />
        <span className="hidden-xs"> {m?.trackViewer.moreInfo}</span>
      </Button>{' '}
      <Button
        onClick={() => {
          dispatch(trackViewerUploadTrack());
        }}
        disabled={!hasTrack}
      >
        <FontAwesomeIcon icon="cloud-upload" />
        <span className="hidden-xs"> {m?.trackViewer.share}</span>
      </Button>{' '}
      <Button
        onClick={handleConvertToDrawing}
        disabled={!hasTrack}
        title={m?.general.convertToDrawing}
      >
        <FontAwesomeIcon icon="pencil" />
        <span className="hidden-xs"> {m?.general.convertToDrawing}</span>
      </Button>
    </>
  );
}

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
