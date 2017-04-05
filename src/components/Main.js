import React from 'react';
import { Map, ScaleControl } from 'react-leaflet';
import { connect } from 'react-redux';
import queryString from 'query-string';

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

import Settings from 'fm3/components/Settings';

import * as FmPropTypes from 'fm3/propTypes';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

import { mapRefocus } from 'fm3/actions/mapActions';
import { setTool, setActivePopup, setLocation } from 'fm3/actions/mainActions';

import { baseLayers, overlayLayers } from 'fm3/mapDefinitions';
import { setMapLeafletElement } from 'fm3/leafletElementHolder';

import 'fm3/styles/main.scss';

class Main extends React.Component {

  static propTypes = {
    lat: React.PropTypes.number.isRequired,
    lon: React.PropTypes.number.isRequired,
    zoom: React.PropTypes.number.isRequired,
    tool: FmPropTypes.tool,
    tileFormat: FmPropTypes.tileFormat.isRequired,
    overlays: FmPropTypes.overlays.isRequired,
    overlayOpacity: FmPropTypes.overlayOpacity.isRequired,
    mapType: FmPropTypes.mapType.isRequired,
    onSetTool: React.PropTypes.func.isRequired,
    onMapRefocus: React.PropTypes.func.isRequired,
    activePopup: React.PropTypes.string,
    onLaunchPopup: React.PropTypes.func.isRequired,
    progress: React.PropTypes.bool,
    onSetLocation: React.PropTypes.func.isRequired,
    mouseCursor: React.PropTypes.string.isRequired,
  };

  componentWillMount() {
    // set redux according to URL
    this.props.onMapRefocus(getMapDiff(this.props));
  }

  componentDidMount() {
    setMapLeafletElement(this.map.leafletElement);
  }

  componentWillReceiveProps(newProps) {
    this.ignoreMapMoveEndEvent = true;

    const stateChanged = ['mapType', 'overlays', 'zoom', 'lat', 'lon'].some(prop => newProps[prop] !== this.props[prop]);
    if (stateChanged) {
      // update URL
      updateUrl(newProps);
    } else {
      // set redux according to URL
      const changes = getMapDiff(newProps);
      if (Object.keys(changes).length) {
        newProps.onMapRefocus(changes);
      }
    }
  }

  componentDidUpdate() {
    this.ignoreMapMoveEndEvent = false;
  }

  componentWillUnmount() {
    setMapLeafletElement(null);
  }

  handleMapMoveEnd = () => {
    if (this.ignoreMapMoveEndEvent) {
      return;
    }

    const map = this.map.leafletElement;
    const { lat, lng: lon } = map.getCenter();
    const zoom = map.getZoom();

    if (this.props.lat !== lat || this.props.lon !== lon || this.props.zoom !== zoom) {
      this.props.onMapRefocus({ lat, lon, zoom });
    }
  }

  handleMapTypeChange = (mapType) => {
    if (this.props.mapType !== mapType) {
      this.props.onMapRefocus({ mapType });
    }
  }

  handleOverlayChange = (overlays) => {
    this.props.onMapRefocus({ overlays });
  }

  handleLocationFound = (e) => {
    this.props.onSetLocation(e.latitude, e.longitude, e.accuracy);
  }

  handleToggleTool(tool) {
    this.props.onSetTool(this.props.tool === tool ? null : tool);
  }

  render() {
    const { tool, tileFormat, activePopup, onLaunchPopup, progress, mouseCursor } = this.props;
    const showDefaultMenu = [null, 'select-home-location', 'location'].indexOf(tool) !== -1;

    return (
      <div className="container-fluid">
        <Row>
          <Navbar fluid style={{ marginBottom: 0 }}>
            <NavbarHeader />
            <Navbar.Collapse>
              {tool === 'objects' && <ObjectsMenu />}
              {(showDefaultMenu || tool === 'search') && <SearchMenu />}
              {tool === 'route-planner' && <RoutePlannerMenu />}
              {(tool === 'measure' || tool === 'measure-ele' || tool === 'measure-area') && <MeasurementMenu />}
              {tool === 'track-viewer' && <TrackViewerMenu />}
              {activePopup === 'settings' && <Settings />}
              {showDefaultMenu &&
                <Nav key="nav" className="hidden-sm">
                  <NavItem onClick={() => this.handleToggleTool('objects')}>
                    <FontAwesomeIcon icon="map-marker" /> Miesta
                  </NavItem>
                  <NavItem onClick={() => this.handleToggleTool('route-planner')}>
                    <FontAwesomeIcon icon="map-signs" /> Plánovač
                  </NavItem>
                  <NavItem onClick={() => this.handleToggleTool('measure')}>
                    <FontAwesomeIcon icon="arrows-h" /> Meranie
                  </NavItem>
                  <NavItem onClick={() => this.handleToggleTool('location')} active={tool === 'location'}>
                    <FontAwesomeIcon icon="dot-circle-o" /> Kde som?
                  </NavItem>
                  <NavItem onClick={() => this.handleToggleTool('track-viewer')} active={tool === 'track-viewer'}>
                    <FontAwesomeIcon icon="road" /> Prehliadač trás
                  </NavItem>
                </Nav>
              }
              {showDefaultMenu &&
                <Nav pullRight className="hidden-xs hidden-lg">
                  <NavDropdown title="Viac" id="additional-menu-items">
                    <MenuItem onClick={() => onLaunchPopup('settings')}>
                      <FontAwesomeIcon icon="cog" /> Nastavenia
                    </MenuItem>
                    <MenuItem divider />
                    <MenuItem onClick={() => window.open('http://wiki.freemap.sk/NahlasenieChyby')}>
                      <FontAwesomeIcon icon="exclamation-triangle" /> Nahlás chybu
                    </MenuItem>
                  </NavDropdown>
                </Nav>
              }
              {showDefaultMenu &&
                <Nav pullRight className="hidden-lg hidden-md hidden-xs">
                  <NavDropdown title="Nástroje" id="tools">
                    <MenuItem onClick={() => this.handleToggleTool('objects')}>
                      <FontAwesomeIcon icon="map-marker" /> Miesta
                    </MenuItem>
                    <MenuItem onClick={() => this.handleToggleTool('route-planner')}>
                      <FontAwesomeIcon icon="map-signs" /> Plánovač
                    </MenuItem>
                    <MenuItem onClick={() => this.handleToggleTool('measure')}>
                      <FontAwesomeIcon icon="arrows-h" /> Meranie
                    </MenuItem>
                    <MenuItem onClick={() => this.handleToggleTool('location')} active={tool === 'location'}>
                      <FontAwesomeIcon icon="dot-circle-o" /> Kde som?
                    </MenuItem>
                    <MenuItem onClick={() => this.handleToggleTool('track-viewer')} active={tool === 'track-viewer'}>
                      <FontAwesomeIcon icon="road" /> Prehliadač trás
                    </MenuItem>
                  </NavDropdown>
                </Nav>
              }
              {showDefaultMenu &&
                <Nav pullRight className="hidden-sm hidden-md">
                  <NavItem onClick={() => onLaunchPopup('settings')}>
                    <FontAwesomeIcon icon="cog" /> Nastavenia
                  </NavItem>
                  <NavItem onClick={() => window.open('http://wiki.freemap.sk/NahlasenieChyby')}>
                    <FontAwesomeIcon icon="exclamation-triangle" /> Nahlás chybu
                  </NavItem>
                </Nav>
              }
            </Navbar.Collapse>
          </Navbar>
        </Row>
        <Row>
          <ProgressIndicator active={progress} />
        </Row>
        <Row className={`map-holder active-map-type-${this.props.mapType}`}>
          <Map
            ref={(map) => { this.map = map; }}
            center={L.latLng(this.props.lat, this.props.lon)}
            zoom={this.props.zoom}
            onMoveend={this.handleMapMoveEnd}
            onClick={handleMapClick}
            onLocationfound={this.handleLocationFound}
            style={{ cursor: mouseCursor }}
          >
            <Layers
              mapType={this.props.mapType} onMapChange={this.handleMapTypeChange}
              overlays={this.props.overlays} onOverlaysChange={this.handleOverlayChange}
              tileFormat={tileFormat} overlayOpacity={this.props.overlayOpacity}
            />

            <ScaleControl imperial={false} position="bottomright" />

            {(showDefaultMenu || tool === 'search') && <SearchResults />}

            {tool === 'objects' && <ObjectsResult />}

            {tool === 'route-planner' && <RoutePlannerResult />}

            {tool === 'measure' && <DistanceMeasurementResult />}

            {tool === 'measure-ele' && <ElevationMeasurementResult />}

            {tool === 'measure-area' && <AreaMeasurementResult />}

            {tool === 'location' && <LocationResult />}

            {tool === 'track-viewer' && <TrackViewerResult />}
          </Map>
        </Row>

        <Toasts />
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
    overlayOpacity: state.map.overlayOpacity,
    tileFormat: state.map.tileFormat,
    activePopup: state.main.activePopup,
    progress: state.main.progress,
    mouseCursor: state.map.mouseCursor,
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


const baseLetters = baseLayers.map(({ type }) => type).join('');
const overlayLetters = overlayLayers.map(({ type }) => type).join('');
const layersRegExp = new RegExp(`^[${baseLetters}][${overlayLetters}]*$`);

function getMapDiff(props) {
  const { location: { search } } = props;

  const query = queryString.parse(search);

  const [zoomFrag, latFrag, lonFrag] = (query.map || '').split('/');

  const lat = parseFloat(latFrag);
  const lon = parseFloat(lonFrag);
  const zoom = parseInt(zoomFrag, 10);

  const layers = query.layers || '';

  const layersOK = layersRegExp.test(layers);

  if (!layersOK || isNaN(lat) || isNaN(lon) || isNaN(zoom)) {
    updateUrl(props);
    return {};
  }

  const mapType = layers.charAt(0);
  const overlays = layers.length > 1 ? layers.substring(1).split('') : [];

  const changes = {};

  if (mapType !== props.mapType) {
    changes.mapType = mapType;
  }

  if (overlays.join('') !== props.overlays.join('')) {
    changes.overlays = overlays;
  }

  if (Math.abs(lat - props.lat) > 0.00001) {
    changes.lat = lat;
  }

  if (Math.abs(lon - props.lon) > 0.00001) {
    changes.lon = lon;
  }

  if (zoom !== props.zoom) {
    changes.zoom = zoom;
  }

  return changes;
}

function updateUrl(props) {
  const { mapType, overlays, zoom, lat, lon } = props;
  props.history.replace({
    search: `?map=${zoom}/${lat.toFixed(5)}/${lon.toFixed(5)}&layers=${mapType}${overlays.join('')}`,
  });
}

function handleMapClick({ latlng: { lat, lng: lon } }) {
  mapEventEmitter.emit('mapClick', lat, lon);
}
