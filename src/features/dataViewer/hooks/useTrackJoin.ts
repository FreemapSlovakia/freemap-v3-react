import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { canJoinTracks } from '../joinTracks.js';
import { dataViewerJoinTracks } from '../model/actions.js';

/**
 * The armed join: while it is on, every line but the armed one offers itself as
 * what to join with, and a click there joins them.
 */
export function useTrackJoin() {
  const dispatch = useDispatch();

  const joinWith = useAppSelector((state) => state.trackViewer.joinWith);

  const trackGeojson = useAppSelector(
    (state) => state.trackViewer.trackGeojson,
  );

  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    if (!joinWith) {
      setHovered(null);
    }
  }, [joinWith]);

  /** Whether this feature is a line the armed track can be joined with. */
  const isCandidate = (featureIndex: number) =>
    joinWith !== null &&
    canJoinTracks(
      trackGeojson?.features ?? [],
      joinWith.featureIndex,
      featureIndex,
    );

  return {
    armed: joinWith !== null,

    /** The candidate under the pointer, drawn apart so the pair is visible. */
    hovered: joinWith && hovered !== null ? hovered : null,

    handleMove(featureIndex: number) {
      if (isCandidate(featureIndex) && hovered !== featureIndex) {
        setHovered(featureIndex);
      }
    },

    handleOut() {
      if (hovered !== null) {
        setHovered(null);
      }
    },

    /**
     * True when the join answered the click, so the caller does not also select
     * — which would take the armed mode with it. The armed track answers its
     * own click with nothing rather than letting it deselect.
     */
    handleClick(featureIndex: number): boolean {
      if (!joinWith) {
        return false;
      }

      if (isCandidate(featureIndex)) {
        dispatch(dataViewerJoinTracks(featureIndex));

        return true;
      }

      return featureIndex === joinWith.featureIndex;
    },
  };
}
