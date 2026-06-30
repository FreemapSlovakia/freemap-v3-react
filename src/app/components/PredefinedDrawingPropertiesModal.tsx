import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { useDrawingStyleEditor } from '@features/drawing/components/useDrawingStyleEditor.js';
import { drawingSettingsInitialState } from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import { useDrawingMessages } from '@features/drawing/translations/useDrawingMessages.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { ReactElement, SubmitEvent, useCallback } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FaCheck, FaFill, FaPaintBrush, FaTimes, FaUndo } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { applySettings, setActiveModal } from '../store/actions.js';

type Props = { show: boolean };

export default function PredefinedDrawingPropertiesModal({
  show,
}: Props): ReactElement {
  const m = useMessages();

  const dm = useDrawingMessages();

  const style = useAppSelector((state) => state.drawingSettings.style);

  const editor = useDrawingStyleEditor(style, { widthStep: 0.1 });

  const dispatch = useDispatch();

  function save(applyToAll = false) {
    dispatch(
      applySettings({
        drawing: editor.style,
        drawingApplyAll: applyToAll,
      }),
    );

    dispatch(setActiveModal(null));
  }

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();

    save(false);
  };

  const handleApplyToAllClick = () => {
    save(true);
  };

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  useDocumentTitle(show ? dm?.defProps.menuItem : undefined);

  return (
    <Modal
      show={show}
      onHide={close}
      contentClassName="bg-body-tertiary"
      scrollable
      // The color picker's popover is portalled to <body> (outside this
      // modal's DOM), so the modal's focus trap would steal focus from its
      // inputs the moment they're focused. Disable enforceFocus so R/G/B/A/HEX
      // (and the sliders) stay editable.
      enforceFocus={false}
    >
      <form onSubmit={handleSubmit} className="d-contents">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPaintBrush /> {dm?.defProps.title}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>{editor.element}</Modal.Body>

        <Modal.Footer>
          <Button type="submit" disabled={editor.invalid}>
            <FaCheck /> {m?.general.save}
          </Button>

          <Button
            variant="secondary"
            disabled={editor.invalid}
            onClick={handleApplyToAllClick}
          >
            <FaFill /> {dm?.defProps.applyToAll}
          </Button>

          <Button
            variant="warning"
            onClick={() => editor.reset(drawingSettingsInitialState.style)}
          >
            <FaUndo /> {m?.general.resetToDefaults}
          </Button>

          <Button variant="dark" onClick={close}>
            <FaTimes /> {m?.general.cancel}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
