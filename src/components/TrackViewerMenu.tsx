import {
  clearMap,
  convertToDrawing,
  setActiveModal,
} from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import {
  ColorizingMode,
  trackViewerColorizeTrackBy,
  trackViewerSetData,
  trackViewerToggleElevationChart,
  trackViewerUploadTrack,
} from 'fm3/actions/trackViewerActions';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import 'fm3/styles/trackViewer.scss';
import { ReactElement, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import {
  FaChartArea,
  FaCloudUploadAlt,
  FaInfoCircle,
  FaPaintBrush,
  FaPencilAlt,
  FaUpload,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { getType } from 'typesafe-actions';
import { assertType } from 'typescript-is';
import { DeleteButton } from './DeleteButton';

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
        className="ml-1"
        variant="secondary"
        onClick={() => {
          dispatch(setActiveModal('upload-track'));
        }}
      >
        <FaUpload />
        <span className="d-none d-sm-inline"> {m?.trackViewer.upload}</span>
      </Button>
      {trackGeojsonIsSuitableForElevationChart && (
        <Button
          className="ml-1"
          variant="secondary"
          active={elevationChartActive}
          onClick={() => {
            dispatch(trackViewerToggleElevationChart());
          }}
        >
          <FaChartArea />
          <span className="d-none d-sm-inline">
            {' '}
            {m?.general.elevationProfile}
          </span>
        </Button>
      )}
      {trackGeojsonIsSuitableForElevationChart && (
        <Dropdown
          className="ml-1"
          onSelect={(approach) => {
            dispatch(
              trackViewerColorizeTrackBy(
                assertType<ColorizingMode | null>(approach),
              ),
            );
          }}
        >
          <Dropdown.Toggle id="colorizing_mode" variant="secondary">
            <FaPaintBrush />{' '}
            {m?.trackViewer.colorizingMode[colorizeTrackBy ?? 'none']}
          </Dropdown.Toggle>
          <Dropdown.Menu
            popperConfig={{
              strategy: 'fixed',
            }}
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
          </Dropdown.Menu>
        </Dropdown>
      )}
      {trackGeojsonIsSuitableForElevationChart && (
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
        >
          <FaInfoCircle />
          <span className="d-none d-sm-inline"> {m?.trackViewer.moreInfo}</span>
        </Button>
      )}
      {hasTrack && (
        <Button
          className="ml-1"
          variant="secondary"
          onClick={() => {
            dispatch(trackViewerUploadTrack());
          }}
        >
          <FaCloudUploadAlt />
          <span className="d-none d-sm-inline"> {m?.trackViewer.share}</span>
        </Button>
      )}
      {hasTrack && (
        <Button
          className="ml-1"
          variant="secondary"
          onClick={handleConvertToDrawing}
          title={m?.general.convertToDrawing}
        >
          <FaPencilAlt />
          <span className="d-none d-sm-inline">
            {' '}
            {m?.general.convertToDrawing}
          </span>
        </Button>
      )}
      {hasTrack && <DeleteButton />}
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
