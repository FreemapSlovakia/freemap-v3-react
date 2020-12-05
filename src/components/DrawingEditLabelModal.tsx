import React, { useState, useCallback, ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Alert from 'react-bootstrap/lib/Alert';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';

import { drawingChangeLabel } from 'fm3/actions/drawingPointActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';

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
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      dispatch(drawingChangeLabel({ label: editedLabel }));

      close();
    },
    [editedLabel, dispatch, close],
  );

  const handleLocalLabelChange = useCallback(
    (e: React.FormEvent<FormControl>) => {
      setEditedLabel((e.target as HTMLInputElement).value);
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
            <ControlLabel>{m?.drawing.edit.label}</ControlLabel>
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
          <Button type="submit" bsStyle="info">
            <Glyphicon glyph="floppy-disk" /> {m?.general.save}
          </Button>
          <Button type="button" onClick={close}>
            <Glyphicon glyph="remove" /> {m?.general.cancel} <kbd>Esc</kbd>
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
