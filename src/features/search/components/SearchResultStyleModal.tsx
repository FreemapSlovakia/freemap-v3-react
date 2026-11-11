import { DrawingStyleSettingsModal } from '@features/drawing/components/DrawingStyleSettingsModal.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import {
  searchSetLabelSettings,
  searchSetResultStyle,
} from '../model/actions.js';
import { searchSettingsInitialState } from '../model/settingsReducer.js';

type Props = { show: boolean };

export default function SearchResultStyleModal({ show }: Props): ReactElement {
  const m = useMessages();

  const style = useAppSelector((state) => state.searchSettings.resultStyle);

  const visibility = useAppSelector(
    (state) => state.searchSettings.labelVisibility,
  );

  const minZoom = useAppSelector((state) => state.searchSettings.labelMinZoom);

  const dispatch = useDispatch();

  return (
    <DrawingStyleSettingsModal
      show={show}
      title={m?.mapLayers.lookupStyle}
      current={style}
      defaults={searchSettingsInitialState.resultStyle}
      currentLabels={{ visibility, minZoom }}
      defaultLabels={{
        visibility: searchSettingsInitialState.labelVisibility,
        minZoom: searchSettingsInitialState.labelMinZoom,
      }}
      onSave={(s, labels) => {
        dispatch(searchSetResultStyle(s));

        dispatch(searchSetLabelSettings(labels));
      }}
    />
  );
}
