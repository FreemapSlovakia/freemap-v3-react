import React from 'react';
import { connect } from 'react-redux';

import Modal from 'react-bootstrap/lib/Modal';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Button from 'react-bootstrap/lib/Button';
import Alert from 'react-bootstrap/lib/Alert';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';

import { mapSetTileFormat, mapSetOverlayOpacity } from 'fm3/actions/mapActions';
import { setTool, setHomeLocation, closePopup } from 'fm3/actions/mainActions';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { formatGpsCoord } from 'fm3/geoutils';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';
import * as FmPropTypes from 'fm3/propTypes';


class Settings extends React.Component {

  static propTypes = {
    homeLocation: React.PropTypes.shape({
      lat: React.PropTypes.number,
      lon: React.PropTypes.number,
    }),
    tileFormat: FmPropTypes.tileFormat.isRequired,
    onSave: React.PropTypes.func.isRequired,
    onClosePopup: React.PropTypes.func.isRequired,
    onShowToast: React.PropTypes.func.isRequired,
    onSelectHomeLocation: React.PropTypes.func.isRequired,
    onSelectHomeLocationFinished: React.PropTypes.func.isRequired,
    tool: React.PropTypes.string,
    nlcOpacity: React.PropTypes.number.isRequired,
    zoom: React.PropTypes.number,
  };

  constructor(props) {
    super(props);
    this.state = {
      tileFormat: props.tileFormat,
      homeLocation: props.homeLocation,
      homeLocationCssClasses: '',
      userMadeChanges: false,
      nlcOpacity: props.nlcOpacity,
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
    this.props.onSave(this.state.tileFormat, this.state.homeLocation, this.state.nlcOpacity);
    this.props.onShowToast('info', null, 'Zmeny boli uložené.');
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
  }),
  dispatch => ({
    onSave(tileFormat, homeLocation, nlcOpacity) {
      dispatch(mapSetTileFormat(tileFormat));
      dispatch(setHomeLocation(homeLocation));
      dispatch(mapSetOverlayOpacity('N', nlcOpacity));
      dispatch(closePopup());
    },
    onClosePopup() {
      dispatch(closePopup());
    },
    onSelectHomeLocation() {
      dispatch(setTool('select-home-location'));
    },
    onSelectHomeLocationFinished() {
      dispatch(setTool(null));
    },
  }),
)(Settings);
