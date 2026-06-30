import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { useDrawingMessages } from '@features/drawing/translations/useDrawingMessages.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { MarkerTypeSelect } from '@shared/components/MarkerTypeSelect.js';
import { ResetToDefaultsButton } from '@shared/components/ResetToDefaultsButton.js';
import { RgbaColorPicker } from '@shared/components/RgbaColorPicker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { ReactElement, SubmitEvent, useCallback, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { FaCheck, FaPaintBrush, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { objectsSetSettings } from '../model/actions.js';
import { objectsSettingsInitialState } from '../model/settingsReducer.js';
import { useObjectsMessages } from '../translations/useObjectsMessages.js';

type Props = { show: boolean };

export default function ObjectsStyleModal({ show }: Props): ReactElement {
  const m = useMessages();

  const dm = useDrawingMessages();

  const om = useObjectsMessages();

  const markerType = useAppSelector(
    (state) => state.objectsSettings.selectedIcon,
  );

  const color = useAppSelector((state) => state.objectsSettings.color);

  const [editedMarkerType, setEditedMarkerType] = useState(markerType);

  const [editedColor, setEditedColor] = useState(color);

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();

    dispatch(
      objectsSetSettings({
        selectedIcon: editedMarkerType,
        color: editedColor,
      }),
    );

    close();
  };

  const handleReset = useCallback(() => {
    setEditedMarkerType(objectsSettingsInitialState.selectedIcon);

    setEditedColor(objectsSettingsInitialState.color);
  }, []);

  useDocumentTitle(show ? om?.style.title : undefined);

  return (
    <Modal
      show={show}
      onHide={close}
      contentClassName="bg-body-tertiary"
      scrollable
      // The color picker's popover is portalled to <body>; disable enforceFocus
      // so its inputs stay editable (see PredefinedDrawingPropertiesModal).
      enforceFocus={false}
    >
      <form onSubmit={handleSubmit} className="d-contents">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPaintBrush /> {om?.style.title}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group controlId="markerType">
            <Form.Label>{om?.markerShape}</Form.Label>

            <MarkerTypeSelect
              asSelect
              value={editedMarkerType}
              onChange={setEditedMarkerType}
            />
          </Form.Group>

          <Form.Group controlId="color" className="mt-3">
            <Form.Label>{dm?.edit.color}</Form.Label>

            <RgbaColorPicker value={editedColor} onChange={setEditedColor} />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button type="submit">
            <FaCheck /> {m?.general.save}
          </Button>

          <ResetToDefaultsButton onClick={handleReset} />

          <Button variant="dark" onClick={close}>
            <FaTimes /> {m?.general.cancel}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
