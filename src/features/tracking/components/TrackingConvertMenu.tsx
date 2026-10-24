import { useDataMergeMode } from '@features/dataViewer/hooks/useDataMergeMode.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  Action,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
import type { ReactElement } from 'react';
import { MdShapeLine } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { trackingActions } from '../model/actions.js';

type Props = {
  /** Token of the one watched device to act on. Absent acts on every one. */
  token?: string;
};

/**
 * Copies a live track into the map's drawing and data, where it can be edited
 * and exported; the feed goes on. Kept behind the ⋮ toggle as occasional.
 */
export function TrackingConvertMenu({ token }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const askMergeMode = useDataMergeMode();

  async function copyToDataViewer() {
    const mode = await askMergeMode();

    if (mode !== 'cancel') {
      dispatch(trackingActions.copyToDataViewer({ token, mode }));
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
    </ResponsiveActions>
  );
}
