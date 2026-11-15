import { selectFeature, setActiveModal } from '@app/store/actions.js';
import {
  trackingActiveTrackIdSelector,
  trackingTrackSelector,
} from '@app/store/selectors.js';
import {
  elevationChartClose,
  elevationChartOpen,
} from '@features/elevationChart/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { PlaceActionsButton } from '@shared/components/PlaceActionsButton.js';
import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaChartArea, FaCrosshairs, FaEye } from 'react-icons/fa';
import { FaPencil } from 'react-icons/fa6';
import { useDispatch } from 'react-redux';
import { hasElevation } from '../chartTrack.js';
import { trackingActions } from '../model/actions.js';
import { hasDrawableSegment } from '../tracks.js';
import { useTrackingMessages } from '../translations/useTrackingMessages.js';
import { useTrackingCopyAction } from './TrackingConvertMenu.js';
import { TrackingToggleButton } from './TrackingToggleButton.js';

export function TrackingSelection(): ReactElement {
  const m = useMessages();

  const selectedToken = useAppSelector(trackingActiveTrackIdSelector);

  const track = useAppSelector(trackingTrackSelector);

  const tracks = useAppSelector((state) => state.tracking.tracks);

  const trackedDevices = useAppSelector(
    (state) => state.tracking.trackedDevices,
  );

  const convertible =
    track !== undefined &&
    hasDrawableSegment(tracks, trackedDevices, track.token);

  const following = useAppSelector(
    (state) =>
      selectedToken !== undefined && state.map.followedDevice === selectedToken,
  );

  const charted = useAppSelector((state) => {
    const target = state.elevationChart.target;

    return target?.type === 'tracking' && target.token === selectedToken;
  });

  const tm = useTrackingMessages();

  const dispatch = useDispatch();

  const copy = useTrackingCopyAction(selectedToken);

  // Both copies are worked on from a tool's toolbar, and an embedded map opens
  // none.
  const copyAction = !window.fmEmbedded && convertible ? copy : null;

  const lastPoint = track?.trackPoints.at(-1);

  return (
    <Selection
      control={<TrackingToggleButton />}
      icon={<FaEye />}
      label={m?.selections.tracking}
      deletable
    >
      <LongPressTooltip label={tm?.follow}>
        {({ props }) => (
          <Button
            {...props}
            variant="secondary"
            active={following}
            onClick={() => {
              if (selectedToken === undefined) {
                return;
              }

              if (following) {
                dispatch(trackingActions.follow(null));

                return;
              }

              trackMatomo(['trackEvent', 'Tracking', 'follow']);

              dispatch(trackingActions.follow(selectedToken));

              // Following needs nothing of the selection, which would only
              // cover the map.
              dispatch(selectFeature(null));
            }}
          >
            <FaCrosshairs />
          </Button>
        )}
      </LongPressTooltip>

      {selectedToken !== undefined &&
        track &&
        hasElevation(track.trackPoints) && (
          <LongPressTooltip label={m?.general.elevationProfile}>
            {({ props }) => (
              <Button
                {...props}
                variant="secondary"
                active={charted}
                onClick={() =>
                  dispatch(
                    charted
                      ? elevationChartClose()
                      : elevationChartOpen({
                          type: 'tracking',
                          token: selectedToken,
                        }),
                  )
                }
              >
                <FaChartArea />
              </Button>
            )}
          </LongPressTooltip>
        )}

      <LongPressTooltip label={m?.general.modify}>
        {({ props }) => (
          <Button
            {...props}
            variant="secondary"
            onClick={() =>
              dispatch(
                setActiveModal(
                  selectedToken == null
                    ? { type: 'tracking-watched' }
                    : {
                        type: 'tracking-watched',
                        token: String(selectedToken),
                      },
                ),
              )
            }
          >
            <FaPencil />
          </Button>
        )}
      </LongPressTooltip>

      {/* A copyable track always has a position. */}
      {lastPoint && (
        <PlaceActionsButton lat={lastPoint.lat} lon={lastPoint.lon} selection>
          {copyAction}
        </PlaceActionsButton>
      )}
    </Selection>
  );
}
