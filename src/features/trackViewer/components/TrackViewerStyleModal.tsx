import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { useDrawingStyleEditor } from '@features/drawing/components/useDrawingStyleEditor.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { ReactElement, SubmitEvent, useCallback } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FaCheck, FaPaintBrush, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { trackViewerSetStyle } from '../model/actions.js';
import { useTrackViewerMessages } from '../translations/useTrackViewerMessages.js';

type Props = { show: boolean };

export default function TrackViewerStyleModal({ show }: Props): ReactElement {
  const m = useMessages();

  const tvm = useTrackViewerMessages();

  const style = useAppSelector((state) => state.trackViewerSettings.style);

  const editor = useDrawingStyleEditor(style, { widthStep: 0.1 });

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();

    dispatch(trackViewerSetStyle(editor.style));

    close();
  };

  useDocumentTitle(show ? tvm?.style.title : undefined);

  return (
    <Modal
      show={show}
      onHide={close}
      contentClassName="bg-body-tertiary"
      scrollable
      // The color picker's popover is portalled to <body>; disable enforceFocus
      // so its R/G/B/A/HEX inputs stay editable (see PredefinedDrawingPropertiesModal).
      enforceFocus={false}
    >
      <form onSubmit={handleSubmit} className="d-contents">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPaintBrush /> {tvm?.style.title}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>{editor.element}</Modal.Body>

        <Modal.Footer>
          <Button type="submit" disabled={editor.invalid}>
            <FaCheck /> {m?.general.save}
          </Button>

          <Button variant="dark" onClick={close}>
            <FaTimes /> {m?.general.cancel}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
