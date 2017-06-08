import React from 'react';
import PropTypes from 'prop-types';
import { Map, ScaleControl } from 'react-leaflet';
import { connect } from 'react-redux';

import Navbar from 'react-bootstrap/lib/Navbar';
import Row from 'react-bootstrap/lib/Row';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import NavDropdown from 'react-bootstrap/lib/NavDropdown';
import MenuItem from 'react-bootstrap/lib/MenuItem';

import NavbarHeader from 'fm3/components/NavbarHeader';
import Layers from 'fm3/components/Layers';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import ProgressIndicator from 'fm3/components/ProgressIndicator';
import Toasts from 'fm3/components/Toasts';

import SearchMenu from 'fm3/components/SearchMenu';
import SearchResults from 'fm3/components/SearchResults';

import ObjectsMenu from 'fm3/components/ObjectsMenu';
import ObjectsResult from 'fm3/components/ObjectsResult';

import MeasurementMenu from 'fm3/components/MeasurementMenu';
import DistanceMeasurementResult from 'fm3/components/DistanceMeasurementResult';
import AreaMeasurementResult from 'fm3/components/AreaMeasurementResult';
import ElevationMeasurementResult from 'fm3/components/ElevationMeasurementResult';
import LocationResult from 'fm3/components/LocationResult';

import RoutePlannerMenu from 'fm3/components/RoutePlannerMenu';
import RoutePlannerResult from 'fm3/components/RoutePlannerResult';

import TrackViewerMenu from 'fm3/components/TrackViewerMenu';
import TrackViewerResult from 'fm3/components/TrackViewerResult';
import GalleryResult from 'fm3/components/GalleryResult';

import Settings from 'fm3/components/Settings';
import ExternalApps from 'fm3/components/ExternalApps';
import ElevationChart from 'fm3/components/ElevationChart';

import * as FmPropTypes from 'fm3/propTypes';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

import { mapRefocus } from 'fm3/actions/mapActions';
import { setTool, setActivePopup, setLocation } from 'fm3/actions/mainActions';

import { setMapLeafletElement } from 'fm3/leafletElementHolder';

import 'fm3/styles/main.scss';

class Main extends React.Component {

  static propTypes = {
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    zoom: PropTypes.number.isRequired,
    tool: FmPropTypes.tool,
    overlays: FmPropTypes.overlays.isRequired,
    mapType: FmPropTypes.mapType.isRequired,
    onSetTool: PropTypes.func.isRequired,
    onMapRefocus: PropTypes.func.isRequired,
    activePopup: PropTypes.string,
    onLaunchPopup: PropTypes.func.isRequired,
    progress: PropTypes.bool,
    onSetLocation: PropTypes.func.isRequired,
    mouseCursor: PropTypes.string.isRequired,
    expertMode: PropTypes.bool.isRequired,
    embeddedMode: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.foo = 'bar';
  }

  componentDidMount() {
    setMapLeafletElement(this.map.leafletElement);
    document.addEventListener('keydown', (event) => {
      if (event.keyCode === 27) { // Escape key
        this.props.onSetTool(null);
      }
    });

    if (this.props.embeddedMode) {
      document.body.classList.add('embedded');
    }
  }

  componentWillUnmount() {
    setMapLeafletElement(null);
  }

  handleMapMoveEnd = () => {
    // TODO analyze why this can be null
    if (!this.map) {
      return;
    }

    const map = this.map.leafletElement;
    const { lat, lng: lon } = map.getCenter();
    const zoom = map.getZoom();

    if (this.props.lat !== lat || this.props.lon !== lon || this.props.zoom !== zoom) {
      this.props.onMapRefocus({ lat, lon, zoom });
    }
  }

  handleLocationFound = (e) => {
    this.props.onSetLocation(e.latitude, e.longitude, e.accuracy);
  }

  handleToggleTool(tool) {
    this.props.onSetTool(this.props.tool === tool ? null : tool);
  }

  createToolMenu(ele) {
    // eslint-disable-next-line
    const cmi = createMenuItem.bind(this, ele);

    return [
      cmi(1, 'map-marker', 'Miesta', () => this.handleToggleTool('objects')),
      cmi(2, 'map-signs', 'Plánovač', () => this.handleToggleTool('route-planner')),
      cmi(3, 'arrows-h', 'Meranie', () => this.handleToggleTool('measure')),
      cmi(4, 'dot-circle-o', 'Kde som?', () => this.handleToggleTool('location')),
      cmi(5, 'road', 'Prehliadač trás', () => this.handleToggleTool('track-viewer')),
    ];
  }

  createMoreMenu(ele) {
    // eslint-disable-next-line
    const cmi = createMenuItem.bind(this, ele);

    return [
      cmi(1, 'cog', 'Nastavenia', () => this.props.onLaunchPopup('settings')),
      ele === MenuItem ? <MenuItem divider key="_1" /> : null,
      cmi(6, 'mobile', 'Exporty mapy', () => window.open('http://wiki.freemap.sk/FileDownload')),
      ele === MenuItem ? <MenuItem divider key="_2" /> : null,
      cmi(7, 'book', 'Pre začiatočníkov', () => window.open('http://wiki.freemap.sk/StarterGuide')),
      cmi(4, 'github', 'Projekt na GitHub-e', () => window.open('https://github.com/FreemapSlovakia/freemap-v3-react')),
      ele === MenuItem ? <MenuItem divider key="_3" /> : null,
      cmi(2, 'exclamation-triangle', 'Nahlás chybu zobrazenia v mape', () => window.open('http://wiki.freemap.sk/NahlasenieChyby')),
      cmi(3, 'exclamation-triangle', 'Nahlás chybu v portáli', () => window.open('https://github.com/FreemapSlovakia/freemap-v3-react/issues')),
    ];
  }

  openFreemapInNonEmbedMode = () => {
    const currentURL = window.location.href;
    window.open(currentURL.replace('&embed=true', ''), '_blank');
  }

  render() {
    // eslint-disable-next-line
    const { tool, activePopup, onLaunchPopup, progress, mouseCursor, overlays, expertMode, embeddedMode, lat, lon, zoom, mapType } = this.props;
    const showDefaultMenu = [null, 'select-home-location', 'location'].includes(tool);

    return (
      <div className="container-fluid">
        {embeddedMode && <button id="freemap-logo" className="embedded" onClick={this.openFreemapInNonEmbedMode} />}
        <Toasts />
        {!embeddedMode &&
          <Row>
            <Navbar fluid>
              <NavbarHeader />
              <Navbar.Collapse>
                {tool === 'objects' && <ObjectsMenu />}
                {(showDefaultMenu || tool === 'search') && <SearchMenu />}
                {tool === 'route-planner' && <RoutePlannerMenu />}
                {(tool === 'measure' || tool === 'measure-ele' || tool === 'measure-area') && <MeasurementMenu />}
                {tool === 'track-viewer' && <TrackViewerMenu />}
                {activePopup === 'settings' && <Settings />}
                {showDefaultMenu &&
                  <Nav className="hidden-sm hidden-md hidden-lg">
                    {this.createToolMenu(NavItem)}
                    {expertMode && <ExternalApps lat={lat} lon={lon} zoom={zoom} mapType={mapType} />}
                  </Nav>
                }
                {showDefaultMenu &&
                  <Nav pullRight className="hidden-xs">
                    <NavDropdown title={<span><FontAwesomeIcon icon="ellipsis-v" /> Viac</span>} id="additional-menu-items">
                      {this.createMoreMenu(MenuItem)}
                    </NavDropdown>
                  </Nav>
                }
                {showDefaultMenu &&
                  <Nav className="hidden-xs">
                    <NavDropdown title={<span><FontAwesomeIcon icon="briefcase" /> Nástroje</span>} id="tools">
                      {this.createToolMenu(MenuItem)}
                    </NavDropdown>
                    {expertMode && <ExternalApps lat={lat} lon={lon} zoom={zoom} mapType={mapType} />}
                  </Nav>
                }
                {showDefaultMenu &&
                  <Nav pullRight className="hidden-sm hidden-md hidden-lg">
                    {this.createMoreMenu(NavItem)}
                  </Nav>
                }
              </Navbar.Collapse>
            </Navbar>
          </Row>
        }
        {!embeddedMode &&
          <Row>
            <ProgressIndicator active={progress} />
          </Row>
        }
        <Row className={`map-holder active-map-type-${mapType}`}>
          <Map
            ref={(map) => { this.map = map; }}
            center={L.latLng(lat, lon)}
            zoom={zoom}
            onMoveend={this.handleMapMoveEnd}
            onClick={handleMapClick}
            onLocationfound={this.handleLocationFound}
            style={{ cursor: mouseCursor }}
            maxBounds={[[47.63617, 16.69965], [49.66746, 22.67475]]}
          >
            <Layers />

            <ScaleControl imperial={false} position="bottomright" />

            {(showDefaultMenu || tool === 'search') && <SearchResults />}

            {tool === 'objects' && <ObjectsResult />}

            {tool === 'route-planner' && <RoutePlannerResult />}

            {tool === 'measure' && <DistanceMeasurementResult />}

            {tool === 'measure-ele' && <ElevationMeasurementResult />}

            {tool === 'measure-area' && <AreaMeasurementResult />}

            {tool === 'location' && <LocationResult />}

            {tool === 'track-viewer' && <TrackViewerResult />}

            {tool === null && overlays.includes('I') && <GalleryResult />}
            <ElevationChart />
          </Map>
        </Row>
      </div>
    );
  }
}

export default connect(
  state => ({
    lat: state.map.lat,
    lon: state.map.lon,
    zoom: state.map.zoom,
    tool: state.main.tool,
    mapType: state.map.mapType,
    overlays: state.map.overlays,
    activePopup: state.main.activePopup,
    progress: state.main.progress,
    mouseCursor: state.map.mouseCursor,
    expertMode: state.main.expertMode,
    embeddedMode: state.main.embeddedMode,
  }),
  dispatch => ({
    onSetTool(tool) {
      dispatch(setTool(tool));
    },
    onMapRefocus(changes) {
      dispatch(mapRefocus(changes));
    },
    onLaunchPopup(popupName) {
      dispatch(setActivePopup(popupName));
    },
    onSetLocation(lat, lon, accuracy) {
      dispatch(setLocation(lat, lon, accuracy));
    },
  }),
)(Main);

function createMenuItem(ele, key, icon, title, onClick) {
  return React.createElement(ele, { key, onClick }, <FontAwesomeIcon icon={icon} />, ` ${title}`);
}

function handleMapClick({ latlng: { lat, lng: lon } }) {
  mapEventEmitter.emit('mapClick', lat, lon);
}
