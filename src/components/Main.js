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

import GalleryMenu from 'fm3/components/GalleryMenu';
import GalleryResult from 'fm3/components/GalleryResult';

import Settings from 'fm3/components/Settings';
import ExternalApps from 'fm3/components/ExternalApps';
import ElevationChart from 'fm3/components/ElevationChart';

import InfoPointMenu from 'fm3/components/InfoPointMenu';
import InfoPoint from 'fm3/components/InfoPoint';

import ChangesetsMenu from 'fm3/components/ChangesetsMenu';
import Changesets from 'fm3/components/Changesets';

import * as FmPropTypes from 'fm3/propTypes';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

import { mapRefocus } from 'fm3/actions/mapActions';
import { setTool, setActiveModal, setLocation } from 'fm3/actions/mainActions';
import { authLogin, authLogout, authCheckLogin } from 'fm3/actions/authActions';

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
    onPopupLaunch: PropTypes.func.isRequired,
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
  };

  componentWillMount() {
    this.props.onCheckLogin();
  }

  componentDidMount() {
    setMapLeafletElement(this.map.leafletElement);
    document.addEventListener('keydown', (event) => {
      if (event.keyCode === 27) { // Escape key
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

  createToolMenu(ele) {
    // eslint-disable-next-line
    const cmi = createMenuItem.bind(this, ele);

    return [
      cmi(2, 'map-signs', 'Plánovač', () => this.handleToolSelect('route-planner')),
      cmi(1, 'map-marker', 'Miesta', () => this.handleToolSelect('objects')),
      cmi(4, 'dot-circle-o', 'Kde som?', () => this.handleToolSelect('location')),
      cmi(8, 'picture-o', 'Galéria obrázkov', () => this.handleToolSelect('gallery')),
      cmi(3, 'arrows-h', 'Meranie', () => this.handleToolSelect('measure')),
      cmi(5, 'road', 'Prehliadač trás', () => this.handleToolSelect('track-viewer')),
      cmi(6, 'link', 'Odkaz na mapu', () => this.handleToolSelect('info-point')),
      cmi(7, 'pencil', 'Zmeny v mape', () => this.handleToolSelect('changesets')),
    ];
  }

  createMoreMenu(ele) {
    // eslint-disable-next-line
    const cmi = createMenuItem.bind(this, ele);

    const { user, onLogout, onLogin, onPopupLaunch } = this.props;

    return [
      user ?
        cmi('login', 'sign-out', `Odhlás ${user.name}`, () => onLogout())
        :
        cmi('login', 'sign-in', 'Prihlásenie', () => onLogin()),
      cmi(1, 'cog', 'Nastavenia', () => onPopupLaunch('settings')),
      ele === MenuItem ? <MenuItem divider key="_1" /> : null,
      cmi(6, 'mobile', 'Exporty mapy', 'http://wiki.freemap.sk/FileDownload'),
      ele === MenuItem ? <MenuItem divider key="_2" /> : null,
      cmi(7, 'book', 'Pre začiatočníkov', 'http://wiki.freemap.sk/StarterGuide'),
      cmi(4, 'github', 'Projekt na GitHub-e', 'https://github.com/FreemapSlovakia/freemap-v3-react'),
      ele === MenuItem ? <MenuItem divider key="_3" /> : null,
      cmi(2, 'exclamation-triangle', 'Nahlás chybu zobrazenia v mape', 'http://wiki.freemap.sk/NahlasenieChyby'),
      cmi(3, 'exclamation-triangle', 'Nahlás chybu v portáli', 'https://github.com/FreemapSlovakia/freemap-v3-react/issues'),
    ];
  }

  openFreemapInNonEmbedMode = () => {
    const currentURL = window.location.href;
    window.open(currentURL.replace('&embed=true', ''), '_blank');
  }

  render() {
    // eslint-disable-next-line
    const { tool, activeModal, progress, mouseCursor, embeddedMode, lat, lon, zoom, mapType } = this.props;
    const showDefaultMenu = [null, 'select-home-location', 'location'].includes(tool);

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
                {(tool === 'measure' || tool === 'measure-ele' || tool === 'measure-area') && <MeasurementMenu />}
                {tool === 'track-viewer' && <TrackViewerMenu />}
                {tool === 'info-point' && <InfoPointMenu />}
                {tool === 'changesets' && <ChangesetsMenu />}
                {tool === 'gallery' && <GalleryMenu />}
                {activeModal === 'settings' && <Settings />}
                {showDefaultMenu &&
                  <Nav>
                    <NavDropdown title={<span><FontAwesomeIcon icon="briefcase" /> Nástroje</span>} id="tools">
                      {this.createToolMenu(MenuItem)}
                    </NavDropdown>
                    <ExternalApps lat={lat} lon={lon} zoom={zoom} mapType={mapType} />
                    {showDefaultMenu &&
                      <NavDropdown title={<span><FontAwesomeIcon icon="ellipsis-v" /> Viac</span>} id="additional-menu-items">
                        {this.createMoreMenu(MenuItem)}
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
            {tool === 'measure' && <DistanceMeasurementResult />}
            {tool === 'measure-ele' && <ElevationMeasurementResult />}
            {tool === 'measure-area' && <AreaMeasurementResult />}
            {tool === 'location' && <LocationResult />}
            {tool === 'track-viewer' && <TrackViewerResult />}
            {tool === 'info-point' && <InfoPoint />}
            {tool === 'gallery' && <GalleryResult />}
            {tool === 'changesets' && <Changesets />}
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
    activeModal: state.main.activeModal,
    progress: !!state.main.progress.length,
    mouseCursor: state.map.mouseCursor,
    embeddedMode: state.main.embeddedMode,
    user: state.auth.user,
  }),
  dispatch => ({
    onToolSet(tool) {
      dispatch(setTool(tool));
    },
    onMapRefocus(changes) {
      dispatch(mapRefocus(changes));
    },
    onPopupLaunch(modalName) {
      dispatch(setActiveModal(modalName));
    },
    onLocationSet(lat, lon, accuracy) {
      dispatch(setLocation(lat, lon, accuracy));
    },
    onLogin() {
      dispatch(authLogin());
    },
    onLogout() {
      dispatch(authLogout());
    },
    onCheckLogin() {
      dispatch(authCheckLogin());
    },
  }),
)(Main);

function createMenuItem(ele, key, icon, title, onClick) {
  const p = { key };
  if (typeof onClick === 'function') {
    p.onClick = onClick;
  } else {
    p.href = onClick;
    p.target = '_blank';
  }
  return React.createElement(ele, p, <FontAwesomeIcon icon={icon} />, ` ${title}`);
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
