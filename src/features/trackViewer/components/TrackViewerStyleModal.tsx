import { DrawingStyleSettingsModal } from '@features/drawing/components/DrawingStyleSettingsModal.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import { trackViewerSetStyle } from '../model/actions.js';
import { trackViewerSettingsInitialState } from '../model/settingsReducer.js';
import { useTrackViewerMessages } from '../translations/useTrackViewerMessages.js';

type Props = { show: boolean };

export default function TrackViewerStyleModal({ show }: Props): ReactElement {
  const tvm = useTrackViewerMessages();

  const style = useAppSelector((state) => state.trackViewerSettings.style);

  const dispatch = useDispatch();

  return (
    <DrawingStyleSettingsModal
      show={show}
      title={tvm?.style.title}
      current={style}
      defaults={trackViewerSettingsInitialState.style}
      onSave={(s) => dispatch(trackViewerSetStyle(s))}
    />
  );
}
