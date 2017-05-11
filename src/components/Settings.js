import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Modal from 'react-bootstrap/lib/Modal';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Button from 'react-bootstrap/lib/Button';
import Alert from 'react-bootstrap/lib/Alert';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';

import { mapSetTileFormat, mapSetOverlayOpacity, setMouseCursorToCrosshair, resetMouseCursor } from 'fm3/actions/mapActions';
import { setTool, setHomeLocation, closePopup, setExpertMode } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { formatGpsCoord } from 'fm3/geoutils';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';
import * as FmPropTypes from 'fm3/propTypes';

class Settings extends React.Component {

  static propTypes = {
    homeLocation: PropTypes.shape({
      lat: PropTypes.number,
      lon: PropTypes.number,
    }),
    tileFormat: FmPropTypes.tileFormat.isRequired,
    onSave: PropTypes.func.isRequired,
    onClosePopup: PropTypes.func.isRequired,
    onSelectHomeLocation: PropTypes.func.isRequired,
    onSelectHomeLocationFinished: PropTypes.func.isRequired,
    tool: FmPropTypes.tool,
    nlcOpacity: PropTypes.number.isRequired,
    touristOverlayOpacity: PropTypes.number.isRequired,
    cycloOverlayOpacity: PropTypes.number.isRequired,
    zoom: PropTypes.number,
    expertMode: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      tileFormat: props.tileFormat,
      homeLocation: props.homeLocation,
      homeLocationCssClasses: '',
      userMadeChanges: false,
      nlcOpacity: props.nlcOpacity,
      touristOverlayOpacity: props.touristOverlayOpacity,
      cycloOverlayOpacity: props.cycloOverlayOpacity,
      expertMode: props.expertMode,
    };
  }

  componentWillMount() {
    mapEventEmitter.on('mapClick', this.onHomeLocationSelected);
  }

  componentWillUpdate(nextProps, nextState) {
    if (!nextState.userMadeChanges) {
      this.setState({ userMadeChanges: true });
    }
  }

  componentWillUnmount() {
    mapEventEmitter.removeListener('mapClick', this.onHomeLocationSelected);
  }

  onHomeLocationSelected = (lat, lon) => {
    this.setState({ homeLocation: { lat, lon }, homeLocationCssClasses: 'animated flash' }); // via animate.css
    this.props.onSelectHomeLocationFinished();
  }

  handleSave = () => {
    this.props.onSave(this.state.tileFormat,
      this.state.homeLocation,
      this.state.nlcOpacity,
      this.state.touristOverlayOpacity,
      this.state.cycloOverlayOpacity,
      this.state.expertMode,
    );
  }

  render() {
    const { onClosePopup, onSelectHomeLocation, tool, zoom } = this.props;
    const { homeLocation, homeLocationCssClasses, userMadeChanges } = this.state;
    const nlcOverlayIsNotVisible = zoom < 14;

    let homeLocationInfo = 'neurčená';
    if (homeLocation.lat && homeLocation.lon) {
      homeLocationInfo = `${formatGpsCoord(homeLocation.lat, 'SN')} ${formatGpsCoord(homeLocation.lon, 'WE')}`;
    }

    return (
      <Modal show={tool !== 'select-home-location'} onHide={onClosePopup}>
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
          <Alert>
            Mapové dlaždice vyzerajú lepšie v PNG formáte, ale sú asi 4x väčšie než JPG dlaždice.
            Pri pomalom internete preto odporúčame zvoliť JPG.
          </Alert>
          <hr />
          Domovská poloha: <span className={homeLocationCssClasses}>{homeLocationInfo}</span> <br />
          <Button onClick={() => onSelectHomeLocation()}>
            <FontAwesomeIcon icon="crosshairs" /> Vybrať na mape
          </Button>

          <hr />
          Viditeľnosť vrstvy Lesné cesty NLC: {this.state.nlcOpacity.toFixed(1) * 100}%
          <Slider
            value={this.state.nlcOpacity}
            min={0.1}
            max={1.0}
            step={0.1}
            tooltip={false}
            onChange={newOpacity => this.setState({ nlcOpacity: newOpacity })}
          />
          {nlcOverlayIsNotVisible &&
            <Alert>
              NLC vrstva sa zobrazuje až pri detailnejšom priblížení (od zoom úrovne 14).
            </Alert> }

          <hr />
          <div style={{ marginBottom: '10px' }}>
            Expertný mód:<br />
            <ButtonGroup>
              <Button
                active={!this.state.expertMode}
                onClick={() => this.setState({ expertMode: false })}
              >
                Vypnutý
              </Button>
              <Button
                active={this.state.expertMode}
                onClick={() => this.setState({ expertMode: true })}
              >
                Zapnutý
              </Button>
            </ButtonGroup>
          </div>
          {!this.state.expertMode &&
            <Alert>
              V expertnom móde sú dostupné nástroje pre pokročilých používateľov.
            </Alert> }

          {this.state.expertMode &&
            <div>
                Viditeľnosť vrstvy Turistické trasy: {(this.state.touristOverlayOpacity).toFixed(1) * 100}%
              <Slider
                value={this.state.touristOverlayOpacity}
                min={0.1}
                max={1.0}
                step={0.1}
                tooltip={false}
                onChange={newOpacity => this.setState({ touristOverlayOpacity: newOpacity })}
              />
            </div>}

          {this.state.expertMode &&
            <div>
                Viditeľnosť vrstvy Cyklotrasy: {(this.state.cycloOverlayOpacity).toFixed(1) * 100}%
              <Slider
                value={this.state.cycloOverlayOpacity}
                min={0.1}
                max={1.0}
                step={0.1}
                tooltip={false}
                onChange={newOpacity => this.setState({ cycloOverlayOpacity: newOpacity })}
              />
            </div>}
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="info" onClick={this.handleSave} disabled={!userMadeChanges}><Glyphicon glyph="floppy-disk" /> Uložiť</Button>
          <Button onClick={onClosePopup}><Glyphicon glyph="remove" /> Zrušiť</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default connect(
  state => ({
    tileFormat: state.map.tileFormat,
    homeLocation: state.main.homeLocation,
    tool: state.main.tool,
    zoom: state.map.zoom,
    nlcOpacity: state.map.overlayOpacity.N,
    touristOverlayOpacity: state.map.overlayOpacity.t,
    cycloOverlayOpacity: state.map.overlayOpacity.c,
    expertMode: state.main.expertMode,
  }),
  dispatch => ({
    onSave(tileFormat, homeLocation, nlcOpacity, touristOverlayOpacity, cycloOverlayOpacity, expertMode) {
      dispatch(mapSetTileFormat(tileFormat));
      dispatch(setHomeLocation(homeLocation));
      dispatch(mapSetOverlayOpacity('N', nlcOpacity));
      dispatch(mapSetOverlayOpacity('t', touristOverlayOpacity));
      dispatch(mapSetOverlayOpacity('c', cycloOverlayOpacity));
      dispatch(closePopup());
      dispatch(setExpertMode(expertMode));
      dispatch(toastsAdd({
        message: 'Zmeny boli uložené.',
        style: 'info',
        timeout: 3000,
        actions: [{ name: 'OK' }],
      }));
    },
    onClosePopup() {
      dispatch(closePopup());
    },
    onSelectHomeLocation() {
      dispatch(setTool('select-home-location'));
      dispatch(setMouseCursorToCrosshair());
    },
    onSelectHomeLocationFinished() {
      dispatch(setTool(null));
      dispatch(resetMouseCursor());
    },
  }),
)(Settings);
