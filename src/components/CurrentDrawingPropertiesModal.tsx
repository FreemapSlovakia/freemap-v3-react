import { applySettings, setActiveModal } from 'fm3/actions/mainActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useMessages } from 'fm3/l10nInjector';
import {
  ChangeEvent,
  FormEvent,
  ReactElement,
  useCallback,
  useState,
} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { FaCheck, FaFill, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { DrawingRecentColors } from './DrawingRecentColors';

type Props = { show: boolean };

export default CurrentDrawingPropertiesModal;

export function CurrentDrawingPropertiesModal({ show }: Props): ReactElement {
  const m = useMessages();

  const color = useAppSelector((state) => state.main.drawingColor);

  const width = useAppSelector((state) => state.main.drawingWidth);

  const [editedColor, setEditedColor] = useState(color);

  const [editedWidth, setEditedWidth] = useState(String(width));

  const handleLocalColorChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setEditedColor(e.currentTarget.value);
    },
    [],
  );

  const handleLocalWidthChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setEditedWidth(e.currentTarget.value);
    },
    [],
  );

  const dispatch = useDispatch();

  function save(applyToAll = false) {
    dispatch(
      applySettings({
        drawingColor: editedColor,
        drawingWidth: Number(editedWidth) || 4,
        drawingApplyAll: applyToAll,
      }),
    );

    dispatch(setActiveModal(null));
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    save(false);
  };

  const handleApplyToAllClick = () => {
    save(true);
  };

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  return (
    <Modal show={show} onHide={close}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{m?.drawing.defProps.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group>
            <Form.Label>{m?.drawing.edit.color}</Form.Label>

            <Form.Control
              type="color"
              value={editedColor}
              onChange={handleLocalColorChange}
            />

            <DrawingRecentColors onColor={(color) => setEditedColor(color)} />
          </Form.Group>

          <Form.Group>
            <Form.Label>{m?.drawing.edit.width}</Form.Label>

            <Form.Control
              type="number"
              value={editedWidth}
              min={1}
              max={12}
              step={0.1}
              onChange={handleLocalWidthChange}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button type="submit">
            <FaCheck /> {m?.general.save}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={handleApplyToAllClick}
          >
            <FaFill /> {m?.drawing.defProps.applyToAll}
          </Button>

          <Button variant="dark" type="button" onClick={close}>
            <FaTimes /> {m?.general.cancel}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
