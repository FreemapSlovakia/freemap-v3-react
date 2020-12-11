import {
  useState,
  useCallback,
  ReactElement,
  FormEvent,
  ChangeEvent,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { drawingChangeLabel } from 'fm3/actions/drawingPointActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import {
  Alert,
  Button,
  FormControl,
  FormGroup,
  FormLabel,
  Modal,
} from 'react-bootstrap';
import { FontAwesomeIcon } from './FontAwesomeIcon';

export function DrawingEditLabelModal(): ReactElement {
  const m = useMessages();

  const label = useSelector((state: RootState) => {
    const { selection } = state.main;

    return selection?.type === 'draw-points' && selection.id !== undefined
      ? state.drawingPoints.points[selection.id]?.label ?? '???'
      : (selection?.type === 'draw-lines' ||
          selection?.type === 'draw-polygons') &&
        selection.id !== undefined
      ? state.drawingLines.lines[selection.id]?.label ?? '???'
      : '???';
  });

  const [editedLabel, setEditedLabel] = useState(label);

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const saveLabel = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      dispatch(drawingChangeLabel({ label: editedLabel }));

      close();
    },
    [editedLabel, dispatch, close],
  );

  const handleLocalLabelChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setEditedLabel(e.currentTarget.value);
    },
    [],
  );

  return (
    <Modal show onHide={close}>
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
          <Alert>{m?.drawing.edit.hint}</Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit" variant="info">
            <Glyphicon glyph="floppy-disk" /> {m?.general.save}
          </Button>
          <Button type="button" onClick={close}>
            <FontAwesomeIcon icon="close" /> {m?.general.cancel} <kbd>Esc</kbd>
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
