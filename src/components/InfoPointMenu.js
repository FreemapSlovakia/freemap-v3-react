import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import Navbar from 'react-bootstrap/lib/Navbar';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Alert from 'react-bootstrap/lib/Alert';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';

import { infoPointChangePosition, infoPointSetInEditMode, infoPointChangeLabel } from 'fm3/actions/infoPointActions';
import { setTool, setActiveModal, closeModal } from 'fm3/actions/mainActions';
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

  toggleEditMode = () => {
    this.props.onInfoPointSetInEditMode(!this.props.inEditMode);
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
    const { onCancel, inEditMode, onModalLaunch, activeModal, onModalClose } = this.props;
    const shareURL = `${window.location.href}`;
    return (
      <div>
        <Navbar.Form pullLeft>
          <Button onClick={() => this.toggleEditMode()} active={inEditMode} title="Posunúť">
            <FontAwesomeIcon icon="arrows" /><span className="hidden-sm">Posunúť</span>
          </Button>
          {' '}
          <Button onClick={() => onModalLaunch('info-point-change-label')}>
            <FontAwesomeIcon icon="tag" />Zmeniť popis
          </Button>
          {' '}
          <Button onClick={() => onModalLaunch('info-point-share')} title="Zdieľať">
            <FontAwesomeIcon icon="share-alt" /><span className="hidden-sm">Zdieľať</span>
          </Button>
          {' '}
          <Button onClick={() => onModalLaunch('info-point-embed')} title="Vložiť do webstránky">
            <FontAwesomeIcon icon="code" /><span className="hidden-sm"> Vložiť do webstránky</span>
          </Button>
          {' '}
          <Button onClick={onCancel}><Glyphicon glyph="remove" /> Zavrieť</Button>
        </Navbar.Form>

        <Modal show={activeModal === 'info-point-share'} onHide={onModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Zdieľať odkaz na mapu</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Zvolený pohľad na mapu aj s infobodom je dostupný na tejto adrese:
            </p>
            <Alert>
              <a href={shareURL}>{shareURL}</a>
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={onModalClose}><Glyphicon glyph="remove" /> Zavrieť</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={activeModal === 'info-point-change-label'} onHide={onModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Zmeniť popis infobodu</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <form>
              <FormGroup>
                <ControlLabel>Popis infobodu:</ControlLabel>
                <FormControl
                  type="text"
                  placeholder="Tu sa stretneme"
                  value={this.state.editedLabel || ''}
                  onChange={e => this.handleLocalLabelChange(e.target.value)}
                />
              </FormGroup>
            </form>
            <Alert>
              Ak nechcete aby mal infobod popis, nechajte pole popisu prázdne.
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="info" onClick={() => this.saveLabel()}><Glyphicon glyph="floppy-disk" /> Uložiť</Button>
            <Button onClick={onModalClose}><Glyphicon glyph="remove" /> Zrušiť</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={activeModal === 'info-point-embed'} onHide={onModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Vložit do webstránky</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Vložte na vašu stránku tento html kód:</p>
            <Alert style={{ fontFamily: 'monospace' }}>
              {`<iframe src="${shareURL}&embed=true"`}<br />
              {'style="width: 500px; height: 300px; border: 0" />'}
            </Alert>
            <p>Výsledok bude vyzerať následovne:</p>
            <iframe
              title="Freemap.sk"
              style={{ width: '100%', height: '300px', border: '0' }}
              src={`${shareURL}&embed=true`}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={onModalClose}><Glyphicon glyph="remove" /> Zavrieť</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

InfoPointMenu.propTypes = {
  activeModal: PropTypes.string,
  onModalClose: PropTypes.func.isRequired,
  onModalLaunch: PropTypes.func.isRequired,
  label: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  onInfoPointChangePosition: PropTypes.func.isRequired,
  inEditMode: PropTypes.bool.isRequired,
  onInfoPointSetInEditMode: PropTypes.func.isRequired,
  onInfoPointChangeLabel: PropTypes.func.isRequired,
};

export default connect(
  state => ({
    activeModal: state.main.activeModal,
    label: state.infoPoint.label,
    inEditMode: state.infoPoint.inEditMode,
  }),
  dispatch => ({
    onCancel() {
      dispatch(setTool(null));
    },
    onInfoPointChangePosition(lat, lon) {
      dispatch(infoPointChangePosition(lat, lon));
    },
    onInfoPointSetInEditMode(inEditMode) {
      dispatch(infoPointSetInEditMode(inEditMode));
    },
    onInfoPointChangeLabel(label) {
      dispatch(infoPointChangeLabel(label));
    },
    onModalLaunch(modalName) {
      dispatch(setActiveModal(modalName));
    },
    onModalClose() {
      dispatch(closeModal());
    },
  }),
)(InfoPointMenu);
