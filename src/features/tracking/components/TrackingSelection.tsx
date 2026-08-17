import { openTool, setActiveModal } from '@app/store/actions.js';
import {
  isToolOpen,
  trackingActiveTrackIdSelector,
  trackingTrackSelector,
} from '@app/store/selectors.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { FaBullseye, FaEye } from 'react-icons/fa';
import { FaPencil } from 'react-icons/fa6';
import { useDispatch } from 'react-redux';
import { hasDrawableSegment } from '../tracks.js';
import { TrackingConvertMenu } from './TrackingConvertMenu.js';

export function TrackingSelection(): ReactElement {
  const m = useMessages();

  const trackingOpen = useAppSelector((state) => isToolOpen(state, 'tracking'));

  const selectedToken = useAppSelector(trackingActiveTrackIdSelector);

  const track = useAppSelector(trackingTrackSelector);

  const tracks = useAppSelector((state) => state.tracking.tracks);

  const trackedDevices = useAppSelector(
    (state) => state.tracking.trackedDevices,
  );

  const convertible = useMemo(
    () =>
      track !== undefined &&
      hasDrawableSegment(tracks, trackedDevices, track.token),
    [track, tracks, trackedDevices],
  );

  const dispatch = useDispatch();

  return (
    <Selection
      control={
        <LongPressTooltip label={m?.tools.tracking}>
          {({ props }) => (
            <Button
              {...props}
              variant="dark"
              disabled={trackingOpen}
              onClick={() => dispatch(openTool('tracking'))}
            >
              <FaBullseye />
            </Button>
          )}
        </LongPressTooltip>
      }
      icon={<FaEye />}
      label={m?.selections.tracking}
      deletable
    >
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

      {/* Both copies are worked on from a tool's toolbar, and an embedded map
          opens none. */}
      {!window.fmEmbedded && convertible && track && (
        <TrackingConvertMenu token={track.token} />
      )}
    </Selection>
  );
}
