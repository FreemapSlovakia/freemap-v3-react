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
import Checkbox from 'react-bootstrap/lib/Checkbox';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';

import { setActiveModal, setSelectingHomeLocation } from 'fm3/actions/mainActions';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { formatGpsCoord } from 'fm3/geoutils';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';
import * as FmPropTypes from 'fm3/propTypes';
import { overlayLayers } from 'fm3/mapDefinitions';

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
    overlayOpacity: PropTypes.shape({}).isRequired,
    expertMode: PropTypes.bool.isRequired,
    trackViewerEleSmoothingFactor: PropTypes.number.isRequired,
    selectingHomeLocation: PropTypes.bool,
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
    }),
    preventTips: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.state = {
      homeLocationCssClasses: '',
      tileFormat: props.tileFormat,
      homeLocation: props.homeLocation,
      overlayOpacity: props.overlayOpacity,
      expertMode: props.expertMode,
      trackViewerEleSmoothingFactor: props.trackViewerEleSmoothingFactor,
      name: props.user && props.user.name || '',
      email: props.user && props.user.email || '',
      preventTips: props.preventTips,
      selectedOverlay: 't',
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

  handleSave = (e) => {
    e.preventDefault();

    this.props.onSave(
      this.state.tileFormat,
      this.state.homeLocation,
      this.state.overlayOpacity,
      this.state.expertMode,
      this.state.trackViewerEleSmoothingFactor,
      this.props.user ? { name: this.state.name.trim() || null, email: this.state.email.trim() || null } : null,
      this.state.preventTips,
    );
  }

  handleNameChange = (e) => {
    this.setState({ name: e.target.value });
  }

  handleEmailChange = (e) => {
    this.setState({ email: e.target.value });
  }

  handleShowTipsChange = (e) => {
    this.setState({
      preventTips: !e.target.checked,
    });
  }

  handleOverlaySelect = (o) => {
    this.setState({
      selectedOverlay: o,
    });
  }

  render() {
    const { onClose, onHomeLocationSelect, selectingHomeLocation, user } = this.props;
    const { homeLocation, homeLocationCssClasses, tileFormat, expertMode,
      overlayOpacity, trackViewerEleSmoothingFactor, name, email, preventTips, selectedOverlay } = this.state;

      // TODO compare overlay opacity
    const userMadeChanges = ['tileFormat', 'homeLocation', 'expertMode', 'trackViewerEleSmoothingFactor', 'preventTips']
      .some(prop => this.state[prop] !== this.props[prop])
      || user && (name !== (user.name || '') || email !== (user.email || ''))
      || overlayLayers.some(({ type }) => (overlayOpacity[type] || 1) !== (this.props.overlayOpacity[type] || 1));

    const homeLocationInfo = homeLocation
      ? `${formatGpsCoord(homeLocation.lat, 'SN')} ${formatGpsCoord(homeLocation.lon, 'WE')}`
      : 'neurčená';

    const selectedOverlayDetails = overlayLayers.find(({ type }) => type === selectedOverlay);

    return (
      <Modal show={!selectingHomeLocation} onHide={onClose}>
        <form onSubmit={this.handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>
              <FontAwesomeIcon icon="cog" /> Nastavenia
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Tabs id="setting-tabs">
              <Tab title="Mapa" eventKey={1}>
                <p>Formát dlaždíc pre automapu, turistickú a cyklistickú mapu:</p>
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
                <br />
                <br />
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
              </Tab>
              <Tab title="Účet" eventKey={2}>
                {user ? (
                  <React.Fragment>
                    <FormGroup>
                      <ControlLabel>Meno</ControlLabel>
                      <FormControl value={name} onChange={this.handleNameChange} required />
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>E-Mail</ControlLabel>
                      <FormControl type="email" value={email} onChange={this.handleEmailChange} />
                    </FormGroup>
                  </React.Fragment>
                ) : (
                  <Alert>
                    Dostupné iba pre prihásených používateľov.
                  </Alert>
                )}
              </Tab>
              <Tab title="Všeobecné" eventKey={3}>
                <Checkbox onChange={this.handleShowTipsChange} checked={!preventTips}>
                  Zobrazovať tipy po otvorení stránky
                </Checkbox>
              </Tab>
              <Tab title="Expert" eventKey={4}>
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
                {!expertMode &&
                  <React.Fragment>
                    <br />
                    <br />
                    <Alert>
                      V expertnom móde sú dostupné nástroje pre pokročilých používateľov.
                    </Alert>
                  </React.Fragment>
                }
                {expertMode &&
                  <React.Fragment>
                    <hr />
                    <div>
                      <p>Viditeľnosť vrstvy:</p>
                      <DropdownButton
                        id="overlayOpacity"
                        onSelect={this.handleOverlaySelect}
                        title={
                          <React.Fragment>
                            <FontAwesomeIcon icon={selectedOverlayDetails.icon} /> {selectedOverlayDetails.name} {(overlayOpacity[selectedOverlay] || 1).toFixed(1) * 100}%
                          </React.Fragment>
                        }
                      >
                        {
                          overlayLayers.map(({ name: overlayName, type, icon }) => (
                            <MenuItem key={type} eventKey={type}>
                              <FontAwesomeIcon icon={icon} /> {overlayName} {(overlayOpacity[type] || 1).toFixed(1) * 100}%
                            </MenuItem>
                          ))
                        }
                      </DropdownButton>
                      <Slider
                        value={overlayOpacity[selectedOverlay] || 1}
                        min={0.1}
                        max={1.0}
                        step={0.1}
                        tooltip={false}
                        onChange={newOpacity => this.setState({ overlayOpacity: { ...this.state.overlayOpacity, [selectedOverlay]: newOpacity } })}
                      />
                    </div>
                    <hr />
                    <div>
                      <p>Úroveň vyhladzovania pri výpočte celkovej nastúpanej/naklesanej nadmorskej výšky v prehliadači trás: {trackViewerEleSmoothingFactor}</p>
                      <Slider
                        value={trackViewerEleSmoothingFactor}
                        min={1}
                        max={10}
                        step={1}
                        tooltip={false}
                        onChange={newValue => this.setState({ trackViewerEleSmoothingFactor: newValue })}
                      />
                    </div>
                    <Alert>
                      Pri hodnote 1 sa berú do úvahy všetky nadmorské výšky samostatne. Vyššie hodnoty zodpovedajú šírke plávajúceho okna ktorým sa vyhladzujú nadmorské výšky.
                    </Alert>
                  </React.Fragment>
                }
              </Tab>
            </Tabs>
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="info" type="submit" disabled={!userMadeChanges}>
              <Glyphicon glyph="floppy-disk" /> Uložiť
            </Button>
            <Button type="button" onClick={onClose}>
              <Glyphicon glyph="remove" /> Zrušiť
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }
}

export default connect(
  state => ({
    tileFormat: state.map.tileFormat,
    homeLocation: state.main.homeLocation,
    overlayOpacity: state.map.overlayOpacity,
    expertMode: state.main.expertMode,
    trackViewerEleSmoothingFactor: state.trackViewer.eleSmoothingFactor,
    selectingHomeLocation: state.main.selectingHomeLocation,
    user: state.auth.user,
    preventTips: state.tips.preventTips,
  }),
  dispatch => ({
    onSave(tileFormat, homeLocation, overlayOpacity, expertMode, trackViewerEleSmoothingFactor, user, preventTips) {
      // TODO use this
      dispatch({
        type: 'SAVE_SETTINGS',
        payload: {
          tileFormat, homeLocation, overlayOpacity, expertMode, trackViewerEleSmoothingFactor, user, preventTips,
        },
      });
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
