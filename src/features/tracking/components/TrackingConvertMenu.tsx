import { convertToDrawing } from '@app/store/actions.js';
import { useDataMergeMode } from '@features/dataViewer/hooks/useDataMergeMode.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  Action,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useSimplifyPrompt } from '@shared/hooks/useSimplifyPrompt.js';
import type { Position } from 'geojson';
import type { ReactElement } from 'react';
import { FaPencilAlt } from 'react-icons/fa';
import { MdShapeLine } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { trackingActions } from '../model/actions.js';
import { resolveTracks, trackLineSegments } from '../tracks.js';

type Props = {
  /** Token of the one watched device to act on. Absent acts on every one. */
  token?: string;
};

/**
 * What can be made of a live track elsewhere — a loaded track, a drawing.
 * Shared by the selection toolbar and the tool's own, so acting on one device
 * and acting on all of them are the same gesture. Both actions stay packed
 * behind the ⋮ toggle however much room there is: they are occasional, and the
 * toolbar's own controls are what it should spend its width on.
 *
 * Both are copies — the feed goes on — which is what the labels say instead of
 * the "convert" the sources that are consumed use.
 */
export function TrackingConvertMenu({ token }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const askMergeMode = useDataMergeMode();

  const askSimplification = useSimplifyPrompt();

  const tracks = useAppSelector((state) => state.tracking.tracks);

  const trackedDevices = useAppSelector(
    (state) => state.tracking.trackedDevices,
  );

  async function copyToDataViewer() {
    const mode = await askMergeMode();

    if (mode !== 'cancel') {
      dispatch(trackingActions.copyToDataViewer({ token, mode }));
    }
  }

  function copyToDrawing() {
    // Deliberately computed on the click, off the live points as they stand:
    // the suggestion is about the recording that is being copied, and it grows
    // with every fix that arrives.
    const lines: Position[][] = resolveTracks(tracks, trackedDevices)
      .filter((track) => token === undefined || track.token === token)
      .flatMap((track) =>
        trackLineSegments(track).map((segment) =>
          segment.map((point): Position => [point.lon, point.lat]),
        ),
      );

    const tolerance = askSimplification(lines);

    if (tolerance !== null) {
      dispatch(convertToDrawing({ type: 'tracking', id: token, tolerance }));
    }
  }

  return (
    <ResponsiveActions>
      <Action
        icon={<MdShapeLine />}
        label={m?.general.copyTo({ tool: m?.tools.dataViewer })}
        onClick={() => {
          void copyToDataViewer();
        }}
        showFrom="never"
      />

      <Action
        icon={<FaPencilAlt />}
        label={m?.general.copyToDrawing}
        onClick={copyToDrawing}
        showFrom="never"
      />
    </ResponsiveActions>
  );
}
