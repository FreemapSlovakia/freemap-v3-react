import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import Panel from 'react-bootstrap/lib/Panel';
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

class InfoPointMenu extends React.Component {
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
    const { onModalLaunch, activeModal, onModalClose } = this.props;
    return (
      <div>
        <Panel className="fm-toolbar">
          <Button onClick={() => onModalLaunch('info-point-change-label')}>
            <FontAwesomeIcon icon="tag" />Zmeniť popis
          </Button>
        </Panel>

        {activeModal === 'info-point-change-label' &&
          <Modal show onHide={onModalClose}>
            <form>
              <Modal.Header closeButton>
                <Modal.Title>Zmeniť popis infobodu</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <FormGroup>
                  <ControlLabel>Popis infobodu:</ControlLabel>
                  <FormControl
                    type="text"
                    placeholder="Tu sa stretneme"
                    value={this.state.editedLabel || ''}
                    onChange={e => this.handleLocalLabelChange(e.target.value)}
                  />
                </FormGroup>
                <Alert>
                  Ak nechcete aby mal infobod popis, nechajte pole popisu prázdne.
                </Alert>
              </Modal.Body>
              <Modal.Footer>
                <Button bsStyle="info" onClick={() => this.saveLabel()}><Glyphicon glyph="floppy-disk" /> Uložiť</Button>
                <Button onClick={onModalClose}><Glyphicon glyph="remove" /> Zrušiť</Button>
              </Modal.Footer>
            </form>
          </Modal>
        }
      </div>
    );
  }
}

InfoPointMenu.propTypes = {
  activeModal: PropTypes.string,
  onModalClose: PropTypes.func.isRequired,
  onModalLaunch: PropTypes.func.isRequired,
  label: PropTypes.string,
  onInfoPointChangePosition: PropTypes.func.isRequired,
  inEditMode: PropTypes.bool.isRequired,
  onInfoPointChangeLabel: PropTypes.func.isRequired,
};

export default connect(
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
)(InfoPointMenu);
