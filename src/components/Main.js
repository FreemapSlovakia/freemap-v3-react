import React from 'react';
import PropTypes from 'prop-types';
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

  getOpenInDropdown() {
    return this.props.expertMode && (
      <NavDropdown title={<span><FontAwesomeIcon icon="external-link" /> Otvor na</span>} id="open_in-menu-items">
        <MenuItem onClick={() => this.openIn('osm.org')}>OpenStreetMap</MenuItem>
        <MenuItem onClick={() => this.openIn('hiking.sk')}>Hiking.sk</MenuItem>
        <MenuItem onClick={() => this.openIn('josm')}>Editor JOSM</MenuItem>
        <MenuItem onClick={() => this.openIn('osm.org/id')}>Editor iD</MenuItem>
      </NavDropdown>
    );
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

  handleLocationFound = (e) => {
    this.props.onSetLocation(e.latitude, e.longitude, e.accuracy);
  }

  handleToggleTool(tool) {
    this.props.onSetTool(this.props.tool === tool ? null : tool);
  }

  openIn(where) {
    const { zoom, lat, lon } = this.props;
    switch (where) {
      case 'osm.org':
        window.open(`https://www.openstreetmap.org/#map=${zoom}/${lat.toFixed(5)}/${lon.toFixed(5)}`);
        break;
      case 'osm.org/id':
        window.open(`https://www.openstreetmap.org/edit?editor=id#map=${zoom}/${lat.toFixed(5)}/${lon.toFixed(5)}`);
        break;
      case 'josm': {
        const bounds = this.map.leafletElement.getBounds();
        fetch(`http://localhost:8111/load_and_zoom?left=${bounds.getWest()}&right=${bounds.getEast()}&top=${bounds.getNorth()}&bottom=${bounds.getSouth()}`);
        break;
      }
      case 'hiking.sk': {
        const point = L.CRS.EPSG3857.project(L.latLng(lat, lon));
        window.open(`https://mapy.hiking.sk/?zoom=${zoom}&lon=${point.x}&lat=${point.y}&layers=00B00FFFTTFTTTTFFFFFFTTT`);
        break;
      }
      default:
        break;
    }
  }

  render() {
    // eslint-disable-next-line
    const { tool, activePopup, onLaunchPopup, progress, mouseCursor, overlays, expertMode } = this.props;
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
                <Nav className="hidden-sm hidden-md hidden-lg">
                  <NavItem onClick={() => this.handleToggleTool('objects')}>
                    <FontAwesomeIcon icon="map-marker" /> Miesta
                  </NavItem>
                  <NavItem onClick={() => this.handleToggleTool('route-planner')}>
                    <FontAwesomeIcon icon="map-signs" /> Plánovač
                  </NavItem>
                  <NavItem onClick={() => this.handleToggleTool('measure')}>
                    <FontAwesomeIcon icon="arrows-h" /> Meranie
                  </NavItem>
                  <NavItem onClick={() => this.handleToggleTool('location')}>
                    <FontAwesomeIcon icon="dot-circle-o" /> Kde som?
                  </NavItem>
                  <NavItem onClick={() => this.handleToggleTool('track-viewer')}>
                    <FontAwesomeIcon icon="road" /> Prehliadač trás
                  </NavItem>
                  {this.getOpenInDropdown()}
                </Nav>
              }
              {showDefaultMenu &&
                <Nav pullRight className="hidden-xs">
                  <NavDropdown title={<span><FontAwesomeIcon icon="ellipsis-v" /> Viac</span>} id="additional-menu-items">
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
                <Nav className="hidden-xs">
                  <NavDropdown title={<span><FontAwesomeIcon icon="briefcase" /> Nástroje</span>} id="tools">
                    <MenuItem onClick={() => this.handleToggleTool('objects')}>
                      <FontAwesomeIcon icon="map-marker" /> Miesta
                    </MenuItem>
                    <MenuItem onClick={() => this.handleToggleTool('route-planner')}>
                      <FontAwesomeIcon icon="map-signs" /> Plánovač
                    </MenuItem>
                    <MenuItem onClick={() => this.handleToggleTool('measure')}>
                      <FontAwesomeIcon icon="arrows-h" /> Meranie
                    </MenuItem>
                    <MenuItem onClick={() => this.handleToggleTool('location')}>
                      <FontAwesomeIcon icon="dot-circle-o" /> Kde som?
                    </MenuItem>
                    <MenuItem onClick={() => this.handleToggleTool('track-viewer')}>
                      <FontAwesomeIcon icon="road" /> Prehliadač trás
                    </MenuItem>
                  </NavDropdown>
                  {this.getOpenInDropdown()}
                </Nav>
              }
              {showDefaultMenu &&
                <Nav pullRight className="hidden-sm hidden-md hidden-lg">
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
    activePopup: state.main.activePopup,
    progress: state.main.progress,
    mouseCursor: state.map.mouseCursor,
    expertMode: state.main.expertMode,
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
