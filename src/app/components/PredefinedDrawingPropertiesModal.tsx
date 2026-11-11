import {
  dataViewerSetLabelSettings,
  dataViewerSetStyle,
} from '@features/dataViewer/model/actions.js';
import { dataViewerSettingsInitialState } from '@features/dataViewer/model/settingsReducer.js';
import { DrawingStyleSettingsModal } from '@features/drawing/components/DrawingStyleSettingsModal.js';
import {
  type DrawingStyle,
  drawingSettingsInitialState,
} from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import { useDrawingMessages } from '@features/drawing/translations/useDrawingMessages.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { LabelSettings } from '@shared/labelVisibility.js';
import type { ReactElement } from 'react';
import { FaFill } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { applySettings } from '../store/actions.js';

type Props = { show: boolean };

export default function PredefinedDrawingPropertiesModal({
  show,
}: Props): ReactElement {
  const dm = useDrawingMessages();

  const style = useAppSelector((state) => state.drawingSettings.style);

  // The map's own: drawn features render through the data viewer.
  const visibility = useAppSelector(
    (state) => state.trackViewerSettings.labelVisibility,
  );

  const minZoom = useAppSelector(
    (state) => state.trackViewerSettings.labelMinZoom,
  );

  const dispatch = useDispatch();

  // One default for what is drawn and for what arrives unstyled, so the map
  // features follow one style whichever way they came.
  const save = (
    drawing: DrawingStyle,
    labels: LabelSettings,
    drawingApplyAll: boolean,
  ) => {
    dispatch(applySettings({ drawing, drawingApplyAll }));

    dispatch(dataViewerSetStyle(drawing));

    dispatch(dataViewerSetLabelSettings(labels));
  };

  return (
    <DrawingStyleSettingsModal
      show={show}
      title={dm?.defProps.title}
      documentTitle={dm?.defProps.menuItem}
      current={style}
      defaults={drawingSettingsInitialState.style}
      currentLabels={{ visibility, minZoom }}
      defaultLabels={{
        visibility: dataViewerSettingsInitialState.labelVisibility,
        minZoom: dataViewerSettingsInitialState.labelMinZoom,
      }}
      onSave={(drawing, lv) => save(drawing, lv, false)}
      extraActions={[
        {
          key: 'apply-all',
          label: dm?.defProps.applyToAll,
          icon: <FaFill />,
          onClick: (drawing, lv) => save(drawing, lv, true),
        },
      ]}
    />
  );
}
