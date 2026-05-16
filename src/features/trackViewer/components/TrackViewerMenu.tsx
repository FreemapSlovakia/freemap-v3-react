import {
  clearMapFeatures,
  convertToDrawing,
  setActiveModal,
} from '@app/store/actions.js';
import { trackGeojsonIsSuitableForElevationChart } from '@app/store/selectors.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { ActionIcon, Button, Menu } from '@mantine/core';
import { DeleteButton } from '@shared/components/DeleteButton.js';
import { MantineLongPressTooltip } from '@shared/components/MantineLongPressTooltip.js';
import { ToolMenu } from '@shared/components/ToolMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useCallback } from 'react';
import {
  FaCaretDown,
  FaChartArea,
  FaCloudUploadAlt,
  FaInfoCircle,
  FaPaintBrush,
  FaPencilAlt,
  FaUpload,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  ColorizingMode,
  trackViewerColorizeTrackBy,
  trackViewerSetData,
  trackViewerToggleElevationChart,
  trackViewerUploadTrack,
} from '../model/actions.js';

export default TrackViewerMenu;

export function TrackViewerMenu(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const hasTrack = useAppSelector((state) =>
    Boolean(state.trackViewer.trackGeojson),
  );

  const canUpload = useAppSelector((state) => !state.trackViewer.trackUID);

  const elevationChartActive = useAppSelector((state) =>
    Boolean(state.elevationChart.elevationProfilePoints),
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
      <MantineLongPressTooltip breakpoint="sm" label={m?.trackViewer.upload}>
        {({ label, labelHidden, props }) =>
          labelHidden ? (
            <ActionIcon
              className="ms-1"
              variant="filled"
              color="gray"
              size="input-sm"
              onClick={() => {
                dispatch(setActiveModal('upload-track'));
              }}
              {...props}
            >
              <FaUpload />
            </ActionIcon>
          ) : (
            <Button
              className="ms-1"
              color="gray"
              size="sm"
              leftSection={<FaUpload />}
              onClick={() => {
                dispatch(setActiveModal('upload-track'));
              }}
              {...props}
            >
              {label}
            </Button>
          )
        }
      </MantineLongPressTooltip>

      {enableElevationChart && (
        <MantineLongPressTooltip
          breakpoint="sm"
          label={m?.general.elevationProfile}
        >
          {({ label, labelHidden, props }) =>
            labelHidden ? (
              <ActionIcon
                className="ms-1"
                variant={elevationChartActive ? 'light' : 'filled'}
                color="gray"
                size="input-sm"
                onClick={() => {
                  dispatch(trackViewerToggleElevationChart());
                }}
                {...props}
              >
                <FaChartArea />
              </ActionIcon>
            ) : (
              <Button
                className="ms-1"
                color="gray"
                size="sm"
                variant={elevationChartActive ? 'light' : 'filled'}
                leftSection={<FaChartArea />}
                onClick={() => {
                  dispatch(trackViewerToggleElevationChart());
                }}
                {...props}
              >
                {label}
              </Button>
            )
          }
        </MantineLongPressTooltip>
      )}

      {enableElevationChart && (
        <Menu>
          <Menu.Target>
            <Button
              className="ms-1"
              color="gray"
              size="sm"
              leftSection={<FaPaintBrush />}
              rightSection={<FaCaretDown />}
            >
              {m?.trackViewer.colorizingMode[colorizeTrackBy ?? 'none']}
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            {(
              [undefined, 'elevation', 'steepness'] as (
                | ColorizingMode
                | undefined
              )[]
            ).map((mode) => (
              <Menu.Item
                key={mode || 'none'}
                color={mode === colorizeTrackBy ? 'blue' : undefined}
                onClick={() =>
                  dispatch(trackViewerColorizeTrackBy(mode ?? null))
                }
              >
                {m?.trackViewer.colorizingMode[mode ?? 'none']}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      )}

      {enableElevationChart && (
        <MantineLongPressTooltip
          breakpoint="sm"
          label={m?.trackViewer.moreInfo}
        >
          {({ label, labelHidden, props }) =>
            labelHidden ? (
              <ActionIcon
                className="ms-1"
                variant="filled"
                color="gray"
                size="input-sm"
                onClick={() => {
                  dispatch(
                    toastsAdd({
                      id: 'trackViewer.trackInfo',
                      messageKey: 'trackViewer.info',
                      cancelType: [
                        clearMapFeatures.type,
                        trackViewerSetData.type,
                      ],
                      color: 'cyan',
                    }),
                  );
                }}
                {...props}
              >
                <FaInfoCircle />
              </ActionIcon>
            ) : (
              <Button
                className="ms-1"
                color="gray"
                size="sm"
                leftSection={<FaInfoCircle />}
                onClick={() => {
                  dispatch(
                    toastsAdd({
                      id: 'trackViewer.trackInfo',
                      messageKey: 'trackViewer.info',
                      cancelType: [
                        clearMapFeatures.type,
                        trackViewerSetData.type,
                      ],
                      color: 'cyan',
                    }),
                  );
                }}
                {...props}
              >
                {label}
              </Button>
            )
          }
        </MantineLongPressTooltip>
      )}

      {canUpload && (
        <MantineLongPressTooltip breakpoint="sm" label={m?.trackViewer.share}>
          {({ label, labelHidden, props }) =>
            labelHidden ? (
              <ActionIcon
                className="ms-1"
                variant="filled"
                color="gray"
                size="input-sm"
                onClick={() => dispatch(trackViewerUploadTrack())}
                {...props}
              >
                <FaCloudUploadAlt />
              </ActionIcon>
            ) : (
              <Button
                className="ms-1"
                color="gray"
                size="sm"
                leftSection={<FaCloudUploadAlt />}
                onClick={() => dispatch(trackViewerUploadTrack())}
                {...props}
              >
                {label}
              </Button>
            )
          }
        </MantineLongPressTooltip>
      )}

      {hasTrack && (
        <MantineLongPressTooltip
          breakpoint="sm"
          label={m?.general.convertToDrawing}
        >
          {({ label, labelHidden, props }) =>
            labelHidden ? (
              <ActionIcon
                className="ms-1"
                variant="filled"
                color="gray"
                size="input-sm"
                onClick={handleConvertToDrawing}
                {...props}
              >
                <FaPencilAlt />
              </ActionIcon>
            ) : (
              <Button
                className="ms-1"
                color="gray"
                size="sm"
                leftSection={<FaPencilAlt />}
                onClick={handleConvertToDrawing}
                {...props}
              >
                {label}
              </Button>
            )
          }
        </MantineLongPressTooltip>
      )}

      {hasTrack && <DeleteButton />}
    </ToolMenu>
  );
}
