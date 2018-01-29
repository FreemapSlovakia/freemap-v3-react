import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Alert from 'react-bootstrap/lib/Alert';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';

import { infoPointChangeLabel } from 'fm3/actions/infoPointActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import injectL10n from 'fm3/l10nInjector';

class InfoPointLabelModal extends React.Component {
  static propTypes = {
    onModalClose: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    onInfoPointChangeLabel: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      editedLabel: props.label,
    };
  }

  handleLocalLabelChange(editedLabel) {
    this.setState({ editedLabel });
  }

  saveLabel = () => {
    this.props.onInfoPointChangeLabel(this.state.editedLabel);
    this.props.onModalClose();
  }

  render() {
    const { onModalClose, t } = this.props;
    return (
      <Modal show onHide={onModalClose}>
        <form>
          <Modal.Header closeButton>
            <Modal.Title>{t('infoPoint.edit.title')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup>
              <ControlLabel>{t('infoPoint.edit.label')}</ControlLabel>
              <FormControl
                type="text"
                placeholder={t('infoPoint.edit.example')}
                value={this.state.editedLabel || ''}
                onChange={e => this.handleLocalLabelChange(e.target.value)}
              />
            </FormGroup>
            <Alert>{t('infoPoint.edit.hint')}</Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="info" onClick={this.saveLabel}>
              <Glyphicon glyph="floppy-disk" /> {t('general.save')}
            </Button>
            <Button onClick={onModalClose}>
              <Glyphicon glyph="remove" /> {t('general.cancel')}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }
}

export default compose(
  injectL10n(),
  connect(
    state => ({
      label: state.infoPoint.points[state.infoPoint.activeIndex].label,
    }),
    dispatch => ({
      onInfoPointChangeLabel(label) {
        dispatch(infoPointChangeLabel(label));
      },
      onModalClose() {
        dispatch(setActiveModal(null));
      },
    }),
  ),
)(InfoPointLabelModal);
