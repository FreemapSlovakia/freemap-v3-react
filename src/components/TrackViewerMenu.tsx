import { type ReactElement, useCallback } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import {
  FaChartArea,
  FaCloudUploadAlt,
  FaInfoCircle,
  FaPaintBrush,
  FaPencilAlt,
  FaUpload,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { assert } from 'typia';
import {
  clearMapFeatures,
  convertToDrawing,
  setActiveModal,
} from '../actions/mainActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import {
  ColorizingMode,
  trackViewerColorizeTrackBy,
  trackViewerSetData,
  trackViewerToggleElevationChart,
  trackViewerUploadTrack,
} from '../actions/trackViewerActions.js';
import { fixedPopperConfig } from '../fixedPopperConfig.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useMessages } from '../l10nInjector.js';
import { trackGeojsonIsSuitableForElevationChart } from '../selectors/mainSelectors.js';
import '../styles/trackViewer.scss';
import { DeleteButton } from './DeleteButton.js';
import { LongPressTooltip } from './LongPressTooltip.js';
import { ToolMenu } from './ToolMenu.js';

export default TrackViewerMenu;

export function TrackViewerMenu(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const hasTrack = useAppSelector((state) => !!state.trackViewer.trackGeojson);

  const canUpload = useAppSelector((state) => !state.trackViewer.trackUID);

  const elevationChartActive = useAppSelector(
    (state) => !!state.elevationChart.elevationProfilePoints,
  );

  const colorizeTrackBy = useAppSelector(
    (state) => state.trackViewer.colorizeTrackBy,
  );

  const enableElevationChart = useAppSelector(
    trackGeojsonIsSuitableForElevationChart,
  );

  const handleConvertToDrawing = useCallback(() => {
    const tolerance = window.prompt(m?.general.simplifyPrompt, '50');

    if (tolerance !== null) {
      dispatch(
        convertToDrawing({
          type: 'track',
          tolerance: Number(tolerance || '0') / 100000,
        }),
      );
    }
  }, [dispatch, m]);

  return (
    <ToolMenu>
      <LongPressTooltip breakpoint="sm" label={m?.trackViewer.upload}>
        {({ label, labelClassName, props }) => (
          <Button
            className="ms-1"
            variant="secondary"
            onClick={() => {
              dispatch(setActiveModal('upload-track'));
            }}
            {...props}
          >
            <FaUpload />
            <span className={labelClassName}> {label}</span>
          </Button>
        )}
      </LongPressTooltip>

      {enableElevationChart && (
        <LongPressTooltip breakpoint="sm" label={m?.general.elevationProfile}>
          {({ label, labelClassName, props }) => (
            <Button
              className="ms-1"
              variant="secondary"
              active={elevationChartActive}
              onClick={() => {
                dispatch(trackViewerToggleElevationChart());
              }}
              {...props}
            >
              <FaChartArea />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>
      )}

      {enableElevationChart && (
        <Dropdown
          className="ms-1"
          onSelect={(approach) => {
            dispatch(
              trackViewerColorizeTrackBy(
                assert<ColorizingMode | null>(approach),
              ),
            );
          }}
        >
          <Dropdown.Toggle id="colorizing_mode" variant="secondary">
            <FaPaintBrush />{' '}
            {m?.trackViewer.colorizingMode[colorizeTrackBy ?? 'none']}
          </Dropdown.Toggle>

          <Dropdown.Menu popperConfig={fixedPopperConfig}>
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

      {enableElevationChart && (
        <LongPressTooltip breakpoint="sm" label={m?.trackViewer.moreInfo}>
          {({ label, labelClassName, props }) => (
            <Button
              className="ms-1"
              variant="secondary"
              onClick={() => {
                dispatch(
                  toastsAdd({
                    id: 'trackViewer.trackInfo',
                    messageKey: 'trackViewer.info',
                    cancelType: [
                      clearMapFeatures.type,
                      trackViewerSetData.type,
                    ],
                    style: 'info',
                  }),
                );
              }}
              {...props}
            >
              <FaInfoCircle />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>
      )}

      {canUpload && (
        <LongPressTooltip breakpoint="sm" label={m?.trackViewer.share}>
          {({ label, labelClassName, props }) => (
            <Button
              className="ms-1"
              variant="secondary"
              onClick={() => dispatch(trackViewerUploadTrack())}
              {...props}
            >
              <FaCloudUploadAlt />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>
      )}

      {hasTrack && (
        <LongPressTooltip breakpoint="sm" label={m?.general.convertToDrawing}>
          {({ label, labelClassName, props }) => (
            <Button
              className="ms-1"
              variant="secondary"
              onClick={handleConvertToDrawing}
              {...props}
            >
              <FaPencilAlt />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>
      )}

      {hasTrack && <DeleteButton />}
    </ToolMenu>
  );
}
