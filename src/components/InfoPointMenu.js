import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import Navbar from 'react-bootstrap/lib/Navbar';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Alert from 'react-bootstrap/lib/Alert';

import { infoPointChangePosition, infoPointSetInEditMode } from 'fm3/actions/infoPointActions';
import { setTool, setActiveModal, closeModal } from 'fm3/actions/mainActions';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

class InfoPointMenu extends React.Component {
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


  render() {
    const { onCancel, inEditMode, onModalLaunch, lat, lon, label, activeModal, onModalClose } = this.props;
    let shareURL = `${window.location.href}&tool=info-point&info-point-lat=${lat.toFixed(5)}&info-point-lon=${lon.toFixed(5)}`;
    if (label) {
      shareURL += `&info-point-label=${encodeURIComponent(label)}`;
    }
    return (
      <div>
        <Navbar.Form pullLeft>
          <Button onClick={() => this.toggleEditMode()} active={inEditMode}>
            <FontAwesomeIcon icon="arrows" /> Zmeniť polohu bodu
          </Button>
          {' '}
          <Button onClick={() => onModalLaunch('info-point-share')}>
            <FontAwesomeIcon icon="share-alt" /> Zdieľať
          </Button>
        </Navbar.Form>
        <Nav pullRight>
          <NavItem onClick={onCancel}><Glyphicon glyph="remove" /> Zavrieť</NavItem>
        </Nav>

        <Modal show={activeModal === 'info-point-share'} onHide={onModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Zdieľať odkaz na mapu</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Zvolený bod je dostupný na tejto adrese:
            <Alert>
              <a href={shareURL}>{shareURL}</a>
            </Alert>
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
  lat: PropTypes.number,
  lon: PropTypes.number,
  label: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  onInfoPointChangePosition: PropTypes.func.isRequired,
  inEditMode: PropTypes.bool.isRequired,
  onInfoPointSetInEditMode: PropTypes.func.isRequired,
};

export default connect(
  state => ({
    activeModal: state.main.activeModal,
    lat: state.infoPoint.lat,
    lon: state.infoPoint.lon,
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
    onModalLaunch(modalName) {
      dispatch(setActiveModal(modalName));
    },
    onModalClose() {
      dispatch(closeModal());
    },
  }),
)(InfoPointMenu);
