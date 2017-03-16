import React from 'react';
import { connect } from 'react-redux';

import Modal from 'react-bootstrap/lib/Modal';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Button from 'react-bootstrap/lib/Button';
import Alert from 'react-bootstrap/lib/Alert';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

import { setMapTileFormat } from 'fm3/actions/mapActions';
import { setTool, setHomeLocation } from 'fm3/actions/mainActions';
import { closePopup } from 'fm3/actions/mainActions';
import { formatGpsCoord } from 'fm3/geoutils';

import * as FmPropTypes from 'fm3/propTypes';

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tileFormat: props.tileFormat,
      homeLocation: props.homeLocation,
      homeLocationCssClasses: '',
      userMadeChanges: false
    };
  }

  componentWillUpdate(nextProps, nextState) {
    if (!nextState.userMadeChanges) {
      this.setState({ userMadeChanges: true });
    }
  }

  onHomeLocationSelected(homeLocation) {
    this.setState({ homeLocation, homeLocationCssClasses: 'animated flash' }); // via animate.css
    this.props.onSelectHomeLocationFinished();
  }

  save() {
    this.props.onSave(this.state.tileFormat, this.state.homeLocation);
    this.props.onShowToast('info', null, 'Zmeny boli uložené.');
  }

  render() {
    const { onClosePopup, onSelectHomeLocation } = this.props;
    const { homeLocation, homeLocationCssClasses, userMadeChanges } = this.state;
    const b = (fn, ...args) => fn.bind(this, ...args);

    let homeLocationInfo = 'neurčená';
    if (homeLocation.lat && homeLocation.lon) {
      homeLocationInfo = `${formatGpsCoord(homeLocation.lat, 'SN')} ${formatGpsCoord(homeLocation.lon, 'WE')}`;
    }
    return (
      <Modal show onHide={b(onClosePopup)}>
        <Modal.Header closeButton>
          <Modal.Title>Nastavenia</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ marginBottom: '10px' }}>
            Formát dlaždíc:<br />
            <ButtonGroup>
              <Button
                active={this.state.tileFormat === 'png'}
                onClick={() => this.setState({ tileFormat: 'png' })}
              >
                PNG
              </Button>
              <Button
                active={this.state.tileFormat === 'jpeg'}
                onClick={() => this.setState({ tileFormat: 'jpeg' })}
              >
                JPG
              </Button>
            </ButtonGroup>
          </div>
          <Alert bsStyle="success">
            Mapové dlaždice vyzerajú lepšie v PNG formáte, ale sú asi 4x väčšie než JPG dlaždice.
            Pri pomalom internete preto odporúčame zvoliť JPG.
          </Alert>
          <hr />
          Domovská poloha: <span className={homeLocationCssClasses}>{homeLocationInfo}</span> <br />
          <Button onClick={() => onSelectHomeLocation()}>
           <FontAwesomeIcon icon="crosshairs"/> Vybrať na mape
          </Button>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="success" onClick={b(this.save)} disabled={!userMadeChanges}><Glyphicon glyph="floppy-disk"/> Uložiť</Button>
          <Button onClick={b(onClosePopup)}><Glyphicon glyph="remove"/> Zrušiť</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

Settings.propTypes = {
  homeLocation: React.PropTypes.shape({
    lat: React.PropTypes.number,
    lon: React.PropTypes.number
  }),
  tileFormat: FmPropTypes.tileFormat.isRequired,
  onSave: React.PropTypes.func.isRequired,
  onClosePopup: React.PropTypes.func.isRequired,
  onShowToast: React.PropTypes.func.isRequired,
  onSelectHomeLocation: React.PropTypes.func.isRequired,
  onSelectHomeLocationFinished: React.PropTypes.func.isRequired,
};

export default connect(
  function (state) {
    return {
      tileFormat: state.map.tileFormat,
      homeLocation: state.main.homeLocation
    };
  },
  function (dispatch) {
    return {
      onSave(tileFormat, homeLocation) {
        dispatch(setMapTileFormat(tileFormat));
        dispatch(setHomeLocation(homeLocation));
        dispatch(closePopup());
      },
      onClosePopup() {
        dispatch(closePopup());
      },
      onSelectHomeLocation() {
        dispatch(setTool('select-home-location'));
        dispatch(closePopup());
      },
      onSelectHomeLocationFinished() {
        dispatch(setTool(null));
      }
    };
  },
  null,
  { withRef: true }
)(Settings);
