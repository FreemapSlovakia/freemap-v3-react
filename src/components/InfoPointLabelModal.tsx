import React from 'react';
import { connect } from 'react-redux';
import { compose, Dispatch } from 'redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Alert from 'react-bootstrap/lib/Alert';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';

import { infoPointChangeLabel } from 'fm3/actions/infoPointActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import injectL10n, { Translator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

interface IState {
  editedLabel?: string;
}

class InfoPointLabelModal extends React.Component<Props, IState> {
  state: IState = {};

  constructor(props: Props) {
    super(props);
    this.state = {
      editedLabel: props.label,
    };
  }

  saveLabel = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.props.onInfoPointChangeLabel(this.state.editedLabel);
    this.props.onModalClose();
  };

  handleLocalLabelChange = (e: React.FormEvent<FormControl>) => {
    this.setState({ editedLabel: (e.target as HTMLInputElement).value });
  };

  render() {
    const { onModalClose, t } = this.props;
    return (
      <Modal show onHide={onModalClose}>
        <form onSubmit={this.saveLabel}>
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
                value={this.state.editedLabel || ''}
                onChange={this.handleLocalLabelChange}
              />
            </FormGroup>
            <Alert>{t('infoPoint.edit.hint')}</Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit" bsStyle="info">
              <Glyphicon glyph="floppy-disk" /> {t('general.save')}
            </Button>
            <Button type="button" onClick={onModalClose}>
              <Glyphicon glyph="remove" /> {t('general.cancel')}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  label:
    state.infoPoint.activeIndex === null
      ? '???'
      : state.infoPoint.points[state.infoPoint.activeIndex].label,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onInfoPointChangeLabel(label: string | undefined) {
    dispatch(infoPointChangeLabel(label));
  },
  onModalClose() {
    dispatch(setActiveModal(null));
  },
});

export default compose(
  injectL10n(),
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(InfoPointLabelModal);
