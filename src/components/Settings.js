import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Modal from 'react-bootstrap/lib/Modal';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Button from 'react-bootstrap/lib/Button';
import Alert from 'react-bootstrap/lib/Alert';
import Tabs from 'react-bootstrap/lib/Tabs';
import Tab from 'react-bootstrap/lib/Tab';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';

import { mapSetTileFormat, mapSetOverlayOpacity } from 'fm3/actions/mapActions';
import { setHomeLocation, setActiveModal, setExpertMode, setSelectingHomeLocation } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { trackViewerSetEleSmoothingFactor } from 'fm3/actions/trackViewerActions';

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
    onClose: PropTypes.func.isRequired,
    onHomeLocationSelect: PropTypes.func.isRequired,
    onHomeLocationSelectionFinish: PropTypes.func.isRequired,
    nlcOpacity: PropTypes.number.isRequired,
    touristOverlayOpacity: PropTypes.number.isRequired,
    cycloOverlayOpacity: PropTypes.number.isRequired,
    zoom: PropTypes.number,
    expertMode: PropTypes.bool.isRequired,
    trackViewerEleSmoothingFactor: PropTypes.number.isRequired,
    selectingHomeLocation: PropTypes.bool,
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
    }),
  };

  constructor(props) {
    super(props);
    this.state = {
      homeLocationCssClasses: '',
      tileFormat: props.tileFormat,
      homeLocation: props.homeLocation,
      nlcOpacity: props.nlcOpacity,
      touristOverlayOpacity: props.touristOverlayOpacity,
      cycloOverlayOpacity: props.cycloOverlayOpacity,
      expertMode: props.expertMode,
      trackViewerEleSmoothingFactor: props.trackViewerEleSmoothingFactor,
      name: props.user && props.user.name || '',
      email: props.user && props.user.email || '',
    };
  }

  componentWillMount() {
    mapEventEmitter.on('mapClick', this.onHomeLocationSelected);
  }

  componentWillUnmount() {
    mapEventEmitter.removeListener('mapClick', this.onHomeLocationSelected);
  }

  onHomeLocationSelected = (lat, lon) => {
    this.setState({ homeLocation: { lat, lon }, homeLocationCssClasses: 'animated flash' }); // via animate.css
    this.props.onHomeLocationSelectionFinish();
  }

  handleSave = () => {
    this.props.onSave(
      this.state.tileFormat,
      this.state.homeLocation,
      this.state.nlcOpacity,
      this.state.touristOverlayOpacity,
      this.state.cycloOverlayOpacity,
      this.state.expertMode,
      this.state.trackViewerEleSmoothingFactor,
      this.props.user ? { name: this.state.name, email: this.state.email } : null,
    );
  }

  handleNameChange = (e) => {
    this.setState({ name: e.target.value });
  }

  handleEmailChange = (e) => {
    this.setState({ email: e.target.value });
  }

  render() {
    const { onClose, onHomeLocationSelect, selectingHomeLocation, zoom } = this.props;
    const { homeLocation, homeLocationCssClasses, tileFormat, nlcOpacity, expertMode,
      touristOverlayOpacity, cycloOverlayOpacity, trackViewerEleSmoothingFactor, name, email } = this.state;
    const nlcOverlayIsNotVisible = zoom < 14;

    const userMadeChanges = ['tileFormat', 'homeLocation', 'nlcOpacity', 'touristOverlayOpacity', 'cycloOverlayOpacity', 'expertMode', 'trackViewerEleSmoothingFactor']
      .some(prop => this.state[prop] !== this.props[prop])
      || this.props.user && (name !== (this.props.user.name || '') || email !== (this.props.user.email || ''));

    // TODO name, email

    const homeLocationInfo = homeLocation
      ? `${formatGpsCoord(homeLocation.lat, 'SN')} ${formatGpsCoord(homeLocation.lon, 'WE')}`
      : 'neurčená';

    return (
      <Modal show={!selectingHomeLocation} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Nastavenia</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs id="setting-tabs">
            <Tab title="Mapa" eventKey={2}>
              <div style={{ marginBottom: '10px' }}>
                <p>Formát dlaždíc:</p>
                <ButtonGroup>
                  <Button
                    active={tileFormat === 'png'}
                    onClick={() => this.setState({ tileFormat: 'png' })}
                  >
                    PNG
                  </Button>
                  <Button
                    active={tileFormat === 'jpeg'}
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
              <p>
                {'Domovská poloha: '}
                <span className={homeLocationCssClasses}>{homeLocationInfo}</span>
              </p>
              <Button onClick={() => onHomeLocationSelect()}>
                <FontAwesomeIcon icon="crosshairs" /> Vybrať na mape
              </Button>
              <hr />
              <p>Viditeľnosť vrstvy Lesné cesty NLC: {nlcOpacity.toFixed(1) * 100}%</p>
              <Slider
                value={nlcOpacity}
                min={0.1}
                max={1.0}
                step={0.1}
                tooltip={false}
                onChange={newOpacity => this.setState({ nlcOpacity: newOpacity })}
              />
              {nlcOverlayIsNotVisible &&
                <Alert>
                  NLC vrstva sa zobrazuje až pri detailnejšom priblížení (od zoom úrovne 14).
                </Alert>
              }
            </Tab>
            <Tab title="Účet" eventKey={1}>
              {this.props.user ? [
                <FormGroup key="PIj9rh3OVZ">
                  <ControlLabel>Meno</ControlLabel>
                  <FormControl value={name} onChange={this.handleNameChange} />
                </FormGroup>,
                <FormGroup key="4uO0MtU74k">
                  <ControlLabel>E-Mail</ControlLabel>
                  <FormControl type="email" value={email} onChange={this.handleEmailChange} />
                </FormGroup>,
              ] : (
                <Alert>
                    Dostupné iba pre prihásených používateľov.
                </Alert>
              )}
            </Tab>
            <Tab title="Expert" eventKey={3}>
              <div style={{ marginBottom: '10px' }}>
                <p>Expertný mód:</p>
                <ButtonGroup>
                  <Button
                    active={!expertMode}
                    onClick={() => this.setState({ expertMode: false })}
                  >
                    Vypnutý
                  </Button>
                  <Button
                    active={expertMode}
                    onClick={() => this.setState({ expertMode: true })}
                  >
                    Zapnutý
                  </Button>
                </ButtonGroup>
              </div>
              {!expertMode &&
                <Alert>
                  V expertnom móde sú dostupné nástroje pre pokročilých používateľov.
                </Alert>
              }
              {expertMode && [
                <hr key="FbxiwF4ArQ" />,
                <div key="UPdYSt6in3">
                  <p>
                    {'Viditeľnosť vrstvy Turistické trasy: '}
                    {touristOverlayOpacity.toFixed(1) * 100}%
                  </p>
                  <Slider
                    value={touristOverlayOpacity}
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    tooltip={false}
                    onChange={newOpacity => this.setState({ touristOverlayOpacity: newOpacity })}
                  />
                </div>,
                <div key="UNBlQpq84u">
                  <p>
                    {'Viditeľnosť vrstvy Cyklotrasy: '}
                    {cycloOverlayOpacity.toFixed(1) * 100}%
                  </p>
                  <Slider
                    value={cycloOverlayOpacity}
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    tooltip={false}
                    onChange={newOpacity => this.setState({ cycloOverlayOpacity: newOpacity })}
                  />
                </div>,
                <div key="h8NQDtHhE7">
                  <p>Úroveň vyhladzovania pri výpočte celkovej nastúpanej/naklesanej nadmorskej výšky v prehliadači trás: {trackViewerEleSmoothingFactor}</p>
                  <Slider
                    value={trackViewerEleSmoothingFactor}
                    min={1}
                    max={10}
                    step={1}
                    tooltip={false}
                    onChange={newValue => this.setState({ trackViewerEleSmoothingFactor: newValue })}
                  />
                </div>,
                <Alert key="QgbhwWNfG6">
                  Pri hodnote 1 sa berú do úvahy všetky nadmorské výšky samostatne. Vyššie hodnoty zodpovedajú šírke plávajúceho okna ktorým sa vyhladzujú nadmorské výšky.
                </Alert>,
              ]}
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="info" onClick={this.handleSave} disabled={!userMadeChanges}><Glyphicon glyph="floppy-disk" /> Uložiť</Button>
          <Button onClick={onClose}><Glyphicon glyph="remove" /> Zrušiť</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default connect(
  state => ({
    tileFormat: state.map.tileFormat,
    homeLocation: state.main.homeLocation,
    zoom: state.map.zoom,
    nlcOpacity: state.map.overlayOpacity.N,
    touristOverlayOpacity: state.map.overlayOpacity.t,
    cycloOverlayOpacity: state.map.overlayOpacity.c,
    expertMode: state.main.expertMode,
    trackViewerEleSmoothingFactor: state.trackViewer.eleSmoothingFactor,
    selectingHomeLocation: state.main.selectingHomeLocation,
    user: state.auth.user,
  }),
  dispatch => ({
    onSave(tileFormat, homeLocation, nlcOpacity, touristOverlayOpacity, cycloOverlayOpacity, expertMode, trackViewerEleSmoothingFactor, user) {
      // TODO use this
      dispatch({
        type: 'SAVE_SETTINGS',
        payload: {
          tileFormat, homeLocation, nlcOpacity, touristOverlayOpacity, cycloOverlayOpacity, expertMode, trackViewerEleSmoothingFactor, user,
        },
      });

      // TODO get rid of all this
      dispatch(mapSetTileFormat(tileFormat));
      dispatch(setHomeLocation(homeLocation));
      dispatch(mapSetOverlayOpacity('N', nlcOpacity));
      dispatch(mapSetOverlayOpacity('t', touristOverlayOpacity));
      dispatch(mapSetOverlayOpacity('c', cycloOverlayOpacity));
      dispatch(setActiveModal(null));
      dispatch(setExpertMode(expertMode));
      dispatch(trackViewerSetEleSmoothingFactor(trackViewerEleSmoothingFactor));
      dispatch(toastsAdd({
        collapseKey: 'settings.saved',
        message: 'Zmeny boli uložené.',
        style: 'info',
        timeout: 5000,
      }));
    },
    onClose() {
      dispatch(setActiveModal(null));
    },
    onHomeLocationSelect() {
      dispatch(setSelectingHomeLocation(true));
    },
    onHomeLocationSelectionFinish() {
      dispatch(setSelectingHomeLocation(false));
    },
  }),
)(Settings);
