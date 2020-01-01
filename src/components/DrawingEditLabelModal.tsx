import React, { useState, useCallback } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Alert from 'react-bootstrap/lib/Alert';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';

import { drawingChangeLabel } from 'fm3/actions/drawingPointActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const DrawingEditLabelModalInt: React.FC<Props> = ({
  label,
  onSave,
  onModalClose,
  t,
}) => {
  const [editedLabel, setEditedLabel] = useState(label);

  const saveLabel = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSave(editedLabel);
      onModalClose();
    },
    [editedLabel, onSave, onModalClose],
  );

  const handleLocalLabelChange = useCallback(
    (e: React.FormEvent<FormControl>) => {
      setEditedLabel((e.target as HTMLInputElement).value);
    },
    [],
  );

  return (
    <Modal show onHide={onModalClose}>
      <form onSubmit={saveLabel}>
        <Modal.Header closeButton>
          <Modal.Title>{t('drawing.edit.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormGroup>
            <ControlLabel>{t('drawing.edit.label')}</ControlLabel>
            <FormControl
              autoFocus
              type="text"
              value={editedLabel ?? ''}
              onChange={handleLocalLabelChange}
            />
          </FormGroup>
          <Alert>{t('drawing.edit.hint')}</Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit" bsStyle="info">
            <Glyphicon glyph="floppy-disk" /> {t('general.save')}
          </Button>
          <Button type="button" onClick={onModalClose}>
            <Glyphicon glyph="remove" /> {t('general.cancel')} <kbd>Esc</kbd>
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

const mapStateToProps = (state: RootState) => {
  const { selection } = state.main;

  return {
    label:
      selection?.type === 'draw-points' && selection.id !== undefined
        ? state.drawingPoints.points[selection.id].label
        : (selection?.type === 'draw-lines' ||
            selection?.type === 'draw-polygons') &&
          selection.id !== undefined
        ? state.drawingLines.lines[selection.id].label
        : '???',
  };
};

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onSave(label: string | undefined) {
    dispatch(drawingChangeLabel({ label }));
  },
  onModalClose() {
    dispatch(setActiveModal(null));
  },
});

export const DrawingEditLabelModal = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(DrawingEditLabelModalInt));
