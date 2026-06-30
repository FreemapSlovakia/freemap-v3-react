import { DrawingStyleSettingsModal } from '@features/drawing/components/DrawingStyleSettingsModal.js';
import { drawingSettingsInitialState } from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import { useDrawingMessages } from '@features/drawing/translations/useDrawingMessages.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { ReactElement } from 'react';
import { FaFill } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { applySettings } from '../store/actions.js';

type Props = { show: boolean };

export default function PredefinedDrawingPropertiesModal({
  show,
}: Props): ReactElement {
  const dm = useDrawingMessages();

  const style = useAppSelector((state) => state.drawingSettings.style);

  const dispatch = useDispatch();

  return (
    <DrawingStyleSettingsModal
      show={show}
      title={dm?.defProps.title}
      documentTitle={dm?.defProps.menuItem}
      current={style}
      defaults={drawingSettingsInitialState.style}
      onSave={(drawing) =>
        dispatch(applySettings({ drawing, drawingApplyAll: false }))
      }
      extraActions={[
        {
          key: 'apply-all',
          label: dm?.defProps.applyToAll,
          icon: <FaFill />,
          onClick: (drawing) =>
            dispatch(applySettings({ drawing, drawingApplyAll: true })),
        },
      ]}
    />
  );
}
