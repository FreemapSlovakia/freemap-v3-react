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

import Hourglass from './hourglass.jsx';
import createMarker from './markers.js';
import { languages, getBrowserLanguage, readMessages } from './i18n.js';
import mapDefinitions from './mapDefinitions';

const cleanState = {
};

export default class Main extends React.Component {

  constructor(props) {
    super(props);

    const language = 'sk'

    this.state = Object.assign({}, cleanState, {
      map: 'OpenStreetMap Mapnik',
      center: L.latLng(0, 0),
      zoom: 1,
      mode: '',
      fetching: false,
      language,
      messages: readMessages(language)
    }, {});

  }

  componentDidUpdate() {
    const toSave = {};
    [ 'map', 'center', 'zoom', 'language' ]
      .forEach(prop => toSave[prop] = this.state[prop]);
    localStorage.setItem('freemap3', JSON.stringify(toSave));
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

  render() {
    const {fetching, center, zoom, map, messages, language} = this.state;

    const t = key => messages[key] || key;

    return (
      <Hourglass active={fetching}>
        <style>{`
        `}</style>

        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>Freemap3 React</Navbar.Brand>
            <Navbar.Toggle/>
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav>
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
