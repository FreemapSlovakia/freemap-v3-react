import { drawingChangeProperties } from 'fm3/actions/drawingPointActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import { colors } from 'fm3/constants';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useMessages } from 'fm3/l10nInjector';
import {
  ChangeEvent,
  FormEvent,
  ReactElement,
  useCallback,
  useState,
} from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import Modal from 'react-bootstrap/Modal';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

type Props = { show: boolean };

export function DrawingEditLabelModal({ show }: Props): ReactElement {
  const m = useMessages();

  const label = useAppSelector((state) => {
    const { selection } = state.main;

    return selection?.type === 'draw-points' && selection.id !== undefined
      ? state.drawingPoints.points[selection.id]?.label ?? ''
      : selection?.type === 'draw-line-poly' && selection.id !== undefined
      ? state.drawingLines.lines[selection.id]?.label ?? ''
      : '???';
  });

  const color = useAppSelector((state) => {
    const { selection } = state.main;

    return selection?.type === 'draw-points' && selection.id !== undefined
      ? state.drawingPoints.points[selection.id]?.color
      : selection?.type === 'draw-line-poly' && selection.id !== undefined
      ? state.drawingLines.lines[selection.id]?.color
      : '???';
  });

  const width = useAppSelector((state) => {
    const { selection } = state.main;

    return selection?.type === 'draw-line-poly' && selection.id !== undefined
      ? state.drawingLines.lines[selection.id]?.width
      : '???';
  });

  const [editedLabel, setEditedLabel] = useState(label);

  const [editedColor, setEditedColor] = useState(color);

  const [editedWidth, setEditedWidth] = useState(String(width || 4));

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const saveLabel = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      dispatch(
        drawingChangeProperties({
          label: editedLabel,
          color: editedColor,
          width: Number(editedWidth) || undefined,
        }),
      );

      close();
    },
    [dispatch, editedLabel, editedColor, editedWidth, close],
  );

  const handleLocalLabelChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setEditedLabel(e.currentTarget.value);
    },
    [],
  );

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

  return (
    <Modal show={show} onHide={close}>
      <form onSubmit={saveLabel}>
        <Modal.Header closeButton>
          <Modal.Title>{m?.drawing.edit.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <FormGroup>
            <FormLabel>{m?.drawing.edit.label}</FormLabel>

            <FormControl
              autoFocus
              type="text"
              value={editedLabel ?? ''}
              onChange={handleLocalLabelChange}
            />
          </FormGroup>

          <Alert variant="secondary">{m?.drawing.edit.hint}</Alert>

          <FormGroup>
            <FormLabel>{m?.drawing.edit.color}</FormLabel>

            <FormControl
              type="color"
              value={editedColor || colors.normal}
              onChange={handleLocalColorChange}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>{m?.drawing.edit.width}</FormLabel>

            <FormControl
              type="number"
              value={editedWidth || '4'}
              min={0}
              max={12}
              onChange={handleLocalWidthChange}
            />
          </FormGroup>
        </Modal.Body>

        <Modal.Footer>
          <Button type="submit" variant="info">
            <FaCheck /> {m?.general.save}
          </Button>

          <Button variant="dark" type="button" onClick={close}>
            <FaTimes /> {m?.general.cancel} <kbd>Esc</kbd>
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default DrawingEditLabelModal;
