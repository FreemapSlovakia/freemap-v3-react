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

import { infoPointChangeLabel } from 'fm3/actions/infoPointActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const InfoPointLabelModalInt: React.FC<Props> = ({
  label,
  onInfoPointChangeLabel,
  onModalClose,
  index,
  t,
}) => {
  const [editedLabel, setEditedLabel] = useState(label);

  const saveLabel = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (index !== null) {
        onInfoPointChangeLabel(index, editedLabel);
      }
      onModalClose();
    },
    [editedLabel, onInfoPointChangeLabel, onModalClose, index],
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
          <Modal.Title>{t('infoPoint.edit.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormGroup>
            <ControlLabel>{t('infoPoint.edit.label')}</ControlLabel>
            <FormControl
              autoFocus
              type="text"
              placeholder={t('infoPoint.edit.example')}
              value={editedLabel ?? ''}
              onChange={handleLocalLabelChange}
            />
          </FormGroup>
          <Alert>{t('infoPoint.edit.hint')}</Alert>
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

const mapStateToProps = (state: RootState) => ({
  label:
    state.main.selection?.type !== 'info-point' ||
    typeof state.main.selection?.id !== 'number'
      ? '???'
      : state.infoPoint.points[state.main.selection?.id].label,
  index:
    state.main.selection?.type === 'info-point'
      ? state.main.selection?.id ?? null
      : null,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onInfoPointChangeLabel(index: number, label: string | undefined) {
    dispatch(infoPointChangeLabel({ index, label }));
  },
  onModalClose() {
    dispatch(setActiveModal(null));
  },
});

export const InfoPointLabelModal = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(InfoPointLabelModalInt));
