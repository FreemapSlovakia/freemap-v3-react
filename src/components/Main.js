import React from 'react';
import PropTypes from 'prop-types';
import { Map, ScaleControl } from 'react-leaflet';
import { connect } from 'react-redux';

import Navbar from 'react-bootstrap/lib/Navbar';
import Row from 'react-bootstrap/lib/Row';
import Nav from 'react-bootstrap/lib/Nav';
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

import SelectHomeLocationMenu from 'fm3/components/SelectHomeLocationMenu';

import GalleryMenu from 'fm3/components/GalleryMenu';
import GalleryResult from 'fm3/components/GalleryResult';
import AsyncGalleryUploadModal from 'fm3/components/AsyncGalleryUploadModal';

import Settings from 'fm3/components/Settings';
import ExternalApps from 'fm3/components/ExternalApps';
import AsyncElevationChart from 'fm3/components/AsyncElevationChart';

import InfoPointMenu from 'fm3/components/InfoPointMenu';
import InfoPoint from 'fm3/components/InfoPoint';

import ChangesetsMenu from 'fm3/components/ChangesetsMenu';
import Changesets from 'fm3/components/Changesets';

import MapDetailsMenu from 'fm3/components/MapDetailsMenu';
import MapDetails from 'fm3/components/MapDetails';

import * as FmPropTypes from 'fm3/propTypes';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

import { mapRefocus } from 'fm3/actions/mapActions';
import { setTool, setActiveModal, setLocation } from 'fm3/actions/mainActions';
import { authLogin, authStartLogout, authCheckLogin } from 'fm3/actions/authActions';

import { setMapLeafletElement } from 'fm3/leafletElementHolder';

import 'fm3/styles/main.scss';

class Main extends React.Component {
  static propTypes = {
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    zoom: PropTypes.number.isRequired,
    tool: FmPropTypes.tool,
    mapType: FmPropTypes.mapType.isRequired,
    onToolSet: PropTypes.func.isRequired,
    onMapRefocus: PropTypes.func.isRequired,
    activeModal: PropTypes.string,
    onModalLaunch: PropTypes.func.isRequired,
    progress: PropTypes.bool.isRequired,
    onLocationSet: PropTypes.func.isRequired,
    mouseCursor: PropTypes.string.isRequired,
    embeddedMode: PropTypes.bool.isRequired,
    onLogin: PropTypes.func.isRequired,
    onLogout: PropTypes.func.isRequired,
    onCheckLogin: PropTypes.func.isRequired,
    user: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),
    ignoreEscape: PropTypes.bool.isRequired,
    showElevationChart: PropTypes.bool.isRequired,
  };

  componentWillMount() {
    this.props.onCheckLogin();
  }

  componentDidMount() {
    setMapLeafletElement(this.map.leafletElement);
    document.addEventListener('keydown', (event) => {
      if (event.keyCode === 27 /* escape key */ && !this.props.ignoreEscape) {
        this.props.onToolSet(null);
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
    this.props.onLocationSet(e.latitude, e.longitude, e.accuracy);
  }

  handleToolSelect(tool) {
    this.props.onToolSet(this.props.tool === tool ? null : tool);
  }

  createToolMenu() {
    return [
      createMenuItem(2, 'map-signs', 'Plánovač', () => this.handleToolSelect('route-planner')),
      createMenuItem(1, 'map-marker', 'Miesta', () => this.handleToolSelect('objects')),
      createMenuItem(4, 'dot-circle-o', 'Kde som?', () => this.handleToolSelect('location')),
      createMenuItem(8, 'picture-o', 'Galéria obrázkov', () => this.handleToolSelect('gallery')),
      createMenuItem(3, 'arrows-h', 'Meranie', () => this.handleToolSelect('measure-dist')),
      createMenuItem(5, 'road', 'Prehliadač trás', () => this.handleToolSelect('track-viewer')),
      createMenuItem(6, 'link', 'Odkaz na mapu', () => this.handleToolSelect('info-point')),
      createMenuItem(7, 'pencil', 'Zmeny v mape', () => this.handleToolSelect('changesets')),
      createMenuItem(9, 'info', 'Detaily v mape', () => this.handleToolSelect('map-details')),
    ];
  }

  createMoreMenu() {
    const { user, onLogout, onLogin, onModalLaunch } = this.props;

    return [
      user ?
        createMenuItem('login', 'sign-out', `Odhlás ${user.name}`, () => onLogout())
        :
        createMenuItem('login', 'sign-in', 'Prihlásenie', () => onLogin()),
      createMenuItem(1, 'cog', 'Nastavenia', () => onModalLaunch('settings')),
      <MenuItem divider key="_1" />,
      createMenuItem(6, 'mobile', 'Exporty mapy', 'http://wiki.freemap.sk/FileDownload'),
      <MenuItem divider key="_2" />,
      createMenuItem(7, 'book', 'Pre začiatočníkov', 'http://wiki.freemap.sk/StarterGuide'),
      createMenuItem(4, 'github', 'Projekt na GitHub-e', 'https://github.com/FreemapSlovakia/freemap-v3-react'),
      <MenuItem divider key="_3" />,
      createMenuItem(2, 'exclamation-triangle', 'Nahlás chybu zobrazenia v mape', 'http://wiki.freemap.sk/NahlasenieChyby'),
      createMenuItem(3, 'exclamation-triangle', 'Nahlás chybu v portáli', 'https://github.com/FreemapSlovakia/freemap-v3-react/issues'),
    ];
  }

  openFreemapInNonEmbedMode = () => {
    const currentURL = window.location.href;
    window.open(currentURL.replace('&embed=true', ''), '_blank');
  }

  render() {
    // eslint-disable-next-line
    const { tool, activeModal, progress, mouseCursor, embeddedMode, lat, lon, zoom, mapType, showElevationChart } = this.props;
    const showDefaultMenu = [null, 'location'].includes(tool);

    return (
      <div className="container-fluid" onDragOver={() => this.handleToolSelect('track-viewer')}>
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
                {(tool === 'measure-dist' || tool === 'measure-ele' || tool === 'measure-area') && <MeasurementMenu />}
                {tool === 'track-viewer' && <TrackViewerMenu />}
                {tool === 'info-point' && <InfoPointMenu />}
                {tool === 'changesets' && <ChangesetsMenu />}
                {tool === 'gallery' && <GalleryMenu />}
                {tool === 'select-home-location' && <SelectHomeLocationMenu />}
                {tool === 'map-details' && <MapDetailsMenu />}
                {activeModal === 'settings' && <Settings />}
                {showDefaultMenu &&
                  <Nav>
                    <NavDropdown title={<span><FontAwesomeIcon icon="briefcase" /> Nástroje</span>} id="tools">
                      {this.createToolMenu()}
                    </NavDropdown>
                    <ExternalApps lat={lat} lon={lon} zoom={zoom} mapType={mapType} />
                    {showDefaultMenu &&
                      <NavDropdown title={<span><FontAwesomeIcon icon="ellipsis-v" /> Viac</span>} id="additional-menu-items">
                        {this.createMoreMenu()}
                      </NavDropdown>
                    }
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
            onMousemove={handleMapMouseMove}
            onMouseover={handleMapMouseOver}
            onMouseout={handleMapMouseOut}
            onClick={handleMapClick}
            onLocationfound={this.handleLocationFound}
            style={{ cursor: mouseCursor }}
            maxBounds={[[47.040256, 15.4688], [49.837969, 23.906238]]}
          >
            <Layers />
            <ScaleControl imperial={false} position="bottomright" />
            {(showDefaultMenu || tool === 'search') && <SearchResults />}
            {tool === 'objects' && <ObjectsResult />}
            {tool === 'route-planner' && <RoutePlannerResult />}
            {tool === 'measure-dist' && <DistanceMeasurementResult />}
            {tool === 'measure-ele' && <ElevationMeasurementResult />}
            {tool === 'measure-area' && <AreaMeasurementResult />}
            {tool === 'location' && <LocationResult />}
            {tool === 'track-viewer' && <TrackViewerResult />}
            <InfoPoint />
            {tool === 'gallery' && <GalleryResult />}
            {tool === 'changesets' && <Changesets />}
            {tool === 'map-details' && <MapDetails />}

            {showElevationChart && <AsyncElevationChart />}
          </Map>
        </Row>

        {activeModal === 'gallery-upload' && <AsyncGalleryUploadModal />}
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
    activeModal: state.main.activeModal,
    progress: !!state.main.progress.length,
    mouseCursor: selectMouseCursor(state),
    embeddedMode: state.main.embeddedMode,
    user: state.auth.user,
    ignoreEscape: !!(state.main.activeModal && state.main.activeModal !== 'settings' // TODO settings dialog gets also closed
      || state.gallery.activeImageId),
    showElevationChart: !!state.elevationChart.elevationProfilePoints,
  }),
  dispatch => ({
    onToolSet(tool) {
      dispatch(setTool(tool));
    },
    onMapRefocus(changes) {
      dispatch(mapRefocus(changes));
    },
    onModalLaunch(modalName) {
      dispatch(setActiveModal(modalName));
    },
    onLocationSet(lat, lon, accuracy) {
      dispatch(setLocation(lat, lon, accuracy));
    },
    onLogin() {
      dispatch(authLogin());
    },
    onLogout() {
      dispatch(authStartLogout());
    },
    onCheckLogin() {
      dispatch(authCheckLogin());
    },
  }),
)(Main);

function createMenuItem(key, icon, title, onClick) {
  const p = { key };
  if (typeof onClick === 'function') {
    p.onClick = onClick;
  } else {
    p.href = onClick;
    p.target = '_blank';
  }
  return React.createElement(MenuItem, p, <FontAwesomeIcon icon={icon} />, ` ${title}`);
}

function handleMapClick({ latlng: { lat, lng: lon } }) {
  mapEventEmitter.emit('mapClick', lat, lon);
}

function handleMapMouseMove({ latlng: { lat, lng: lon } }) {
  mapEventEmitter.emit('mouseMove', lat, lon);
}

function handleMapMouseOver({ latlng: { lat, lng: lon } }) {
  mapEventEmitter.emit('mouseOver', lat, lon);
}

function handleMapMouseOut({ latlng: { lat, lng: lon } }) {
  mapEventEmitter.emit('mouseOut', lat, lon);
}

function selectMouseCursor(state) {
  switch (state.main.tool) {
    case 'measure-dist':
    case 'measure-ele':
    case 'measure-area':
    case 'select-home-location':
    case 'map-details':
    case 'gallery':
      return 'crosshair';
    case 'route-planner':
      return state.routePlanner.pickMode ? 'crosshair' : 'auto';
    default:
      return 'auto';
  }
}
