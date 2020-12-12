import { ReactElement, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

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
import { Button, DropdownButton } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';

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
        variant="secondary"
        onClick={() => {
          dispatch(setActiveModal('upload-track'));
        }}
      >
        <FontAwesomeIcon icon="upload" />
        <span className="d-none d-sm-inline"> {m?.trackViewer.upload}</span>
      </Button>
      <Button
        className="ml-1"
        variant="secondary"
        active={elevationChartActive}
        onClick={() => {
          dispatch(trackViewerToggleElevationChart());
        }}
        disabled={!trackGeojsonIsSuitableForElevationChart}
      >
        <FontAwesomeIcon icon="bar-chart" />
        <span className="d-none d-sm-inline">
          {' '}
          {m?.general.elevationProfile}
        </span>
      </Button>
      <DropdownButton
        rootCloseEvent="mousedown"
        className="ml-1"
        variant="secondary"
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
            <FontAwesomeIcon icon="paint-brush" />
            {m?.trackViewer.colorizingMode[colorizeTrackBy ?? 'none']}
          </>
        }
      >
        {([undefined, 'elevation', 'steepness'] as const).map((mode) => (
          <Dropdown.Item
            eventKey={mode}
            key={mode || 'none'}
            active={mode === colorizeTrackBy}
          >
            {m?.trackViewer.colorizingMode[mode ?? 'none']}
          </Dropdown.Item>
        ))}
      </DropdownButton>
      <Button
        className="ml-1"
        variant="secondary"
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
        <span className="d-none d-sm-inline"> {m?.trackViewer.moreInfo}</span>
      </Button>
      <Button
        className="ml-1"
        variant="secondary"
        onClick={() => {
          dispatch(trackViewerUploadTrack());
        }}
        disabled={!hasTrack}
      >
        <FontAwesomeIcon icon="cloud-upload" />
        <span className="d-none d-sm-inline"> {m?.trackViewer.share}</span>
      </Button>
      <Button
        className="ml-1"
        variant="secondary"
        onClick={handleConvertToDrawing}
        disabled={!hasTrack}
        title={m?.general.convertToDrawing}
      >
        <FontAwesomeIcon icon="pencil" />
        <span className="d-none d-sm-inline">
          {' '}
          {m?.general.convertToDrawing}
        </span>
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
