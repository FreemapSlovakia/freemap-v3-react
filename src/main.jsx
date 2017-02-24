import React from 'react';
import { Map, TileLayer, Marker, LayersControl } from 'react-leaflet';
import FileSaver from 'file-saver';
import Navbar from 'react-bootstrap/lib/Navbar';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import NavDropdown from 'react-bootstrap/lib/NavDropdown';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Panel from 'react-bootstrap/lib/Panel';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Button from 'react-bootstrap/lib/Button';

import Toposcope from './toposcope.jsx';
import Help from './help.jsx';
import Hourglass from './hourglass.jsx';
import createMarker from './markers.js';
import loadPois from './poiLoader.js';
import { languages, getBrowserLanguage, readMessages } from './i18n.js';
import mapDefinitions from './mapDefinitions';

const poiIcon = createMarker('#ddf');
const observerIcon = createMarker('#f88');
const activeObserverIcon = createMarker('#f00');
const activePoiIcon = createMarker('#66f');

const localStorageName = 'toposcope1';

const cleanState = {
  pois: [],
  activePoiId: null,
  inscriptions: [ '', '{a}', '', '' ]
};

export default class Main extends React.Component {

  constructor(props) {
    super(props);

    let toposcope;
    try {
      toposcope = JSON.parse(localStorage.getItem(localStorageName));
    } catch (e) {
      toposcope = null;
    }
    if (!toposcope || typeof toposcope !== 'object') {
      toposcope = {};
    }
    const language = getBrowserLanguage(toposcope && toposcope.language);
    delete toposcope.language;

    this.state = Object.assign({}, cleanState, {
      map: 'OpenStreetMap Mapnik',
      center: L.latLng(0, 0),
      zoom: 1,
      mode: '',
      fetching: false,
      language,
      messages: readMessages(language),
      showHelp: false,
      showSettings: false,
      loadPoiMaxDistance: 1000,
      onlyNearest: true,
      innerCircleRadius: 25,
      addLineBreaks: false,
      fontSize: 3.5
    }, toposcope || {});

    this.nextId = this.state.pois.reduce((a, { id }) => Math.min(a, id), 0) - 1;
  }

  componentDidUpdate() {
    const toSave = {};
    [ 'pois', 'activePoiId', 'inscriptions', 'map', 'center', 'zoom', 'mode', 'language', 'loadPoiMaxDistance', 'onlyNearest',
      'preventUpturnedText', 'addLineBreaks', 'innerCircleRadius', 'fontSize' ]
      .forEach(prop => toSave[prop] = this.state[prop]);
    localStorage.setItem(localStorageName, JSON.stringify(toSave));
  }

  handleMapMove(e) {
    this.setState({ center: e.target.getCenter() });
  }

  handleMapZoom(e) {
    this.setState({ zoom: e.target.getZoom() });
  }


  handleMapClick(e) {
    console.log('map clicked')
  }


  handleMapChange(map) {
    this.setState({ map });
  }

  handleSetLanguage(language) {
    this.setState({ language, messages: readMessages(language) });
  }


  handleHelpVisibility(showHelp) {
    this.setState({ showHelp });
  }

  handleSettingsVisibility(showSettings) {
    this.setState({ showSettings });
  }

  load() {
    const file = this.refs.file.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          this.setState(JSON.parse(e.target.result));
          this.refs.file.value = null;
        } catch (e) {
          window.alert(this.state.messages['importError']);
        }
      };
      reader.readAsText(file);
    }
  }

  render() {
    const { pois, activePoiId, mode, fetching, center, zoom, map, messages, language,
      inscriptions, showHelp, showSettings, innerCircleRadius, loadPoiMaxDistance, onlyNearest,
      fontSize, addLineBreaks, preventUpturnedText } = this.state;

    const activePoi = pois.find(({ id }) => id === activePoiId);
    const observerPoi = pois.find(({ observer }) => observer);
    const t = key => messages[key] || key;
    const icr = parseFloat(innerCircleRadius);

    return (
      <Hourglass active={fetching}>
        <style>{`
          .leaflet-container {
            cursor: ${[ 'setObserver', 'addPoi', 'loadPois' ].indexOf(mode) !== -1 ? 'crosshair' : ''};
          }
        `}</style>

      <Help onClose={this.handleHelpVisibility.bind(this, false)} show={showHelp} messages={messages} language={language}/>

        <input type="file" ref="file" onChange={this.load.bind(this)} style={{ display: 'none' }}/>

        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>Toposcope Maker</Navbar.Brand>
            <Navbar.Toggle/>
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav>
              <NavItem onClick={this.handleHelpVisibility.bind(this, true)}><Glyphicon glyph="question-sign"/> {t('help')}</NavItem>
              <NavDropdown title={<span><Glyphicon glyph="globe"/> {t('language')}</span>} id="basic-nav-dropdown">
                {Object.keys(languages).map(code =>
                  <MenuItem onClick={this.handleSetLanguage.bind(this, code)} key={code}>
                    {languages[code]}{language === code ? ' ✓' : ''}
                  </MenuItem>)
                }
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <Panel className="map-panel">
                <Map ref="map" style={{ width: '100%', height: '500px' }} center={center} zoom={zoom}
                    onMove={this.handleMapMove.bind(this)}
                    onClick={this.handleMapClick.bind(this)}
                    onZoom={this.handleMapZoom.bind(this)}>

                  <LayersControl position="topright">
                    {
                      mapDefinitions.map(({ name, url, attribution, maxZoom, minZoom }) =>
                        <LayersControl.BaseLayer key={name} name={name} checked={map === name}>
                          <TileLayer attribution={attribution} url={url} onAdd={this.handleMapChange.bind(this, name)}
                            maxZoom={maxZoom} minZoom={minZoom}/>
                        </LayersControl.BaseLayer>
                      )
                    }
                  </LayersControl>
                </Map>
              </Panel>
            </div>
          </div>
        </div>
      </Hourglass>
    );
  }
}
