import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Alert from 'react-bootstrap/lib/Alert';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';

import { infoPointChangePosition, infoPointChangeLabel } from 'fm3/actions/infoPointActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';
import injectL10n from 'fm3/l10nInjector';

class InfoPointMenu extends React.Component {
  static propTypes = {
    activeModal: PropTypes.string,
    onModalClose: PropTypes.func.isRequired,
    onModalLaunch: PropTypes.func.isRequired,
    label: PropTypes.string,
    onInfoPointChangePosition: PropTypes.func.isRequired,
    inEditMode: PropTypes.bool.isRequired,
    onInfoPointChangeLabel: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      editedLabel: props.label,
    };
  }

  componentWillMount() {
    mapEventEmitter.on('mapClick', this.handleInfoPointMove);
  }

  componentWillUnmount() {
    mapEventEmitter.removeListener('mapClick', this.handleInfoPointMove);
  }

  handleInfoPointMove = (lat, lon) => {
    if (this.props.inEditMode) {
      this.props.onInfoPointChangePosition(lat, lon);
    }
  }

  handleLocalLabelChange(editedLabel) {
    this.setState({ editedLabel });
  }

  saveLabel = () => {
    let label = this.state.editedLabel;
    if (label && label.length === 0) {
      label = null;
    }
    this.props.onInfoPointChangeLabel(label);
    this.props.onModalClose();
  }

  render() {
    const { onModalLaunch, activeModal, onModalClose, t } = this.props;
    return (
      <span>
        <span className="fm-label">
          <FontAwesomeIcon icon="thumb-tack" />
          <span className="hidden-xs"> {t('tools.infoPoint')}</span>
        </span>
        {' '}
        <Button onClick={() => onModalLaunch('info-point-change-label')}>
          <FontAwesomeIcon icon="tag" />
          <span className="hidden-xs"> {t('infoPoint.modify')}</span>
        </Button>

        {activeModal === 'info-point-change-label' &&
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
                <Button bsStyle="info" onClick={() => this.saveLabel()}>
                  <Glyphicon glyph="floppy-disk" /> {t('general.save')}
                </Button>
                <Button onClick={onModalClose}>
                  <Glyphicon glyph="remove" /> {t('general.cancel')}
                </Button>
              </Modal.Footer>
            </form>
          </Modal>
        }
      </span>
    );
  }
}

export default compose(
  injectL10n(),
  connect(
    state => ({
      activeModal: state.main.activeModal,
      label: state.infoPoint.label,
      inEditMode: state.main.tool === 'info-point',
    }),
    dispatch => ({
      onInfoPointChangePosition(lat, lon) {
        dispatch(infoPointChangePosition(lat, lon));
      },
      onInfoPointChangeLabel(label) {
        dispatch(infoPointChangeLabel(label));
      },
      onModalLaunch(modalName) {
        dispatch(setActiveModal(modalName));
      },
      onModalClose() {
        dispatch(setActiveModal(null));
      },
    }),
  ),
)(InfoPointMenu);
