import { DrawingStyleSettingsModal } from '@features/drawing/components/DrawingStyleSettingsModal.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import {
  dataViewerSetLabelVisibility,
  dataViewerSetStyle,
} from '../model/actions.js';
import { dataViewerSettingsInitialState } from '../model/settingsReducer.js';
import { useDataViewerMessages } from '../translations/useDataViewerMessages.js';

type Props = { show: boolean };

export default function DataViewerStyleModal({ show }: Props): ReactElement {
  const tvm = useDataViewerMessages();

  const style = useAppSelector((state) => state.trackViewerSettings.style);

  const labelVisibility = useAppSelector(
    (state) => state.trackViewerSettings.labelVisibility,
  );

  const dispatch = useDispatch();

  return (
    <DrawingStyleSettingsModal
      show={show}
      title={tvm?.style.title}
      current={style}
      defaults={dataViewerSettingsInitialState.style}
      currentLabelVisibility={labelVisibility}
      defaultLabelVisibility={dataViewerSettingsInitialState.labelVisibility}
      onSave={(s, lv) => {
        dispatch(dataViewerSetStyle(s));

        dispatch(dataViewerSetLabelVisibility(lv));
      }}
    />
  );
}
