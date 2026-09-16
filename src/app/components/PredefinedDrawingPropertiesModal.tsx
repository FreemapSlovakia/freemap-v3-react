import { DrawingStyleSettingsModal } from '@features/drawing/components/DrawingStyleSettingsModal.js';
import { drawingSetLabelVisibility } from '@features/drawing/model/actions/drawingPointActions.js';
import {
  type DrawingStyle,
  drawingSettingsInitialState,
} from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import { useDrawingMessages } from '@features/drawing/translations/useDrawingMessages.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { LabelVisibility } from '@shared/labelVisibility.js';
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

  const labelVisibility = useAppSelector(
    (state) => state.drawingSettings.labelVisibility,
  );

  const dispatch = useDispatch();

  const save = (
    drawing: DrawingStyle,
    labelVisibility: LabelVisibility,
    drawingApplyAll: boolean,
  ) => {
    dispatch(applySettings({ drawing, drawingApplyAll }));

    dispatch(drawingSetLabelVisibility(labelVisibility));
  };

  return (
    <DrawingStyleSettingsModal
      show={show}
      title={dm?.defProps.title}
      documentTitle={dm?.defProps.menuItem}
      current={style}
      defaults={drawingSettingsInitialState.style}
      currentLabelVisibility={labelVisibility}
      defaultLabelVisibility={drawingSettingsInitialState.labelVisibility}
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
