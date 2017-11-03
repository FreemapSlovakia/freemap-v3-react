import React from 'react';
import PropTypes from 'prop-types';
import { Map, ScaleControl } from 'react-leaflet';
import { connect } from 'react-redux';

import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Button from 'react-bootstrap/lib/Button';
import Panel from 'react-bootstrap/lib/Panel';

import Layers from 'fm3/components/Layers';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
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
import GalleryPicker from 'fm3/components/GalleryPicker';
import GalleryPositionPickingMenu from 'fm3/components/GalleryPositionPickingMenu';
import GalleryShowPositionMenu from 'fm3/components/GalleryShowPositionMenu';

import Settings from 'fm3/components/Settings';
import HomeLocationPickingMenu from 'fm3/components/HomeLocationPickingMenu';

import OpenInExternalAppMenuButton from 'fm3/components/OpenInExternalAppMenuButton';
import ToolsMenuButton from 'fm3/components/ToolsMenuButton';
import MapSwitchButton from 'fm3/components/MapSwitchButton';
import MoreMenuButton from 'fm3/components/MoreMenuButton';

import AsyncElevationChart from 'fm3/components/AsyncElevationChart';

import InfoPointMenu from 'fm3/components/InfoPointMenu';
import InfoPoint from 'fm3/components/InfoPoint';

import ChangesetsMenu from 'fm3/components/ChangesetsMenu';
import ChangesetsResult from 'fm3/components/ChangesetsResult';

import MapDetailsMenu from 'fm3/components/MapDetailsMenu';
import MapDetails from 'fm3/components/MapDetails';

import ShareMapModal from 'fm3/components/ShareMapModal';
import EmbedMapModal from 'fm3/components/EmbedMapModal';
import ExportGpxModal from 'fm3/components/ExportGpxModal';
import LoginModal from 'fm3/components/LoginModal';
import TipsModal from 'fm3/components/TipsModal';

import * as FmPropTypes from 'fm3/propTypes';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

import { mapRefocus, mapReset } from 'fm3/actions/mapActions';
import { setTool, setLocation, clearMap, toggleLocate } from 'fm3/actions/mainActions';
import { authCheckLogin } from 'fm3/actions/authActions';

import { setMapLeafletElement } from 'fm3/leafletElementHolder';

import 'fm3/styles/main.scss';
import 'leaflet/dist/leaflet.css';

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
    progress: PropTypes.bool.isRequired,
    onLocationSet: PropTypes.func.isRequired,
    mouseCursor: PropTypes.string.isRequired,
    onCheckLogin: PropTypes.func.isRequired,
    ignoreEscape: PropTypes.bool.isRequired,
    showElevationChart: PropTypes.bool.isRequired,
    showGalleryPicker: PropTypes.bool.isRequired,
    onMapClear: PropTypes.func.isRequired,
    onLocate: PropTypes.func.isRequired,
    locate: PropTypes.bool.isRequired,
    showLoginModal: PropTypes.bool,
    onMapReset: PropTypes.func.isRequired,
    showMenu: PropTypes.bool,
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

    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
  }

  componentWillUnmount() {
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    setMapLeafletElement(null);
  }

  handleFullscreenChange = () => {
    this.forceUpdate();
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

  handleEmbedLogoClick = () => {
    window.open(window.location.href, '_blank');
  }

  handleToolCloseClick = () => {
    this.props.onToolSet(null);
  }

  handleFullscreenClick = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.body.requestFullscreen();
    }
  }

  handleZoomInClick = () => {
    const zoom = this.map.leafletElement.getZoom() + 1;
    this.props.onMapRefocus({ zoom });
  }

  handleZoomOutClick = () => {
    const zoom = this.map.leafletElement.getZoom() - 1;
    this.props.onMapRefocus({ zoom });
  }

  render() {
    const {
      lat, lon, zoom, mapType,
      tool, activeModal, progress, mouseCursor, showElevationChart, showGalleryPicker, onMapClear,
      showLoginModal, onMapReset, showMenu,
    } = this.props;

    return [
      process.env.DEPLOYMENT === 'next' && (
        <div key="test" id="info-bar">
          Toto je testovacia verzia portálu Freemap Slovakia. Pre ostrú verziu prejdite na <a href="https://www.freemap.sk/">www.freemap.sk</a>.
        </div>
      ),
      <div key="appHolder" id="app-holder">
        <Toasts />

        <div className="tool-buttons">
          {window.self === window.top ?
            <Panel className="fm-toolbar">
              <ButtonToolbar>
                {showMenu ?
                  <ButtonGroup>
                    <Button id="freemap-logo" className={progress ? 'in-progress' : 'idle'} onClick={onMapReset} />
                    <ToolsMenuButton />
                    <Button onClick={onMapClear} title="Vyčistiť mapu">
                      <FontAwesomeIcon icon="eraser" />
                    </Button>
                    <Button onClick={this.handleFullscreenClick} title={document.fullscreenElement ? 'Zrušiť zobrazenie na celú obrazovku' : 'Na celú obrazovku'}>
                      <FontAwesomeIcon icon={document.fullscreenElement ? 'compress' : 'expand'} />
                    </Button>
                    <OpenInExternalAppMenuButton lat={lat} lon={lon} zoom={zoom} mapType={mapType} />
                    <MoreMenuButton />
                  </ButtonGroup>
                  :
                  <Button id="freemap-logo" className={progress ? 'in-progress' : 'idle'} onClick={onMapReset} />
                }
              </ButtonToolbar>
            </Panel>
            :
            <Button id="freemap-logo" className={progress ? 'in-progress' : 'idle'} onClick={this.handleEmbedLogoClick} />
          }
          {showMenu && tool &&
            <Panel className="fm-toolbar">
              {tool === 'search' && <SearchMenu />}
              {tool === 'objects' && <ObjectsMenu />}
              {tool === 'route-planner' && <RoutePlannerMenu />}
              {['measure-dist', 'measure-ele', 'measure-area'].includes(tool) && <MeasurementMenu />}
              {tool === 'track-viewer' && <TrackViewerMenu />}
              {tool === 'info-point' && <InfoPointMenu />}
              {tool === 'changesets' && <ChangesetsMenu />}
              {tool === 'gallery' && <GalleryMenu />}
              {tool === 'map-details' && <MapDetailsMenu />}

              <span>
                {' '}
                <Button onClick={this.handleToolCloseClick} title="Zavrieť nástroj" disabled={!tool}>
                  <FontAwesomeIcon icon="close" /><span className="hidden-xs"> Zavrieť</span>
                </Button>
              </span>
            </Panel>
          }
          <GalleryPositionPickingMenu />
          <GalleryShowPositionMenu />
          <HomeLocationPickingMenu />
        </div>

        <div className="fm-type-zoom-control">
          <Panel className="fm-toolbar">
            <ButtonToolbar>
              <MapSwitchButton />
              <ButtonGroup>
                <Button
                  onClick={this.handleZoomInClick}
                  title="Priblížiť mapu"
                  disabled={this.map && this.props.zoom >= this.map.leafletElement.getMaxZoom()}
                >
                  <FontAwesomeIcon icon="plus" />
                </Button>
                <Button
                  onClick={this.handleZoomOutClick}
                  title="Oddialiť mapu"
                  disabled={this.map && this.props.zoom <= this.map.leafletElement.getMinZoom()}
                >
                  <FontAwesomeIcon icon="minus" />
                </Button>
              </ButtonGroup>
              <Button onClick={this.props.onLocate} title="Kde som?" active={this.props.locate}>
                <FontAwesomeIcon icon="dot-circle-o" />
              </Button>
            </ButtonToolbar>
          </Panel>
        </div>

        {activeModal === 'settings' && <Settings />}
        {activeModal === 'share' && <ShareMapModal />}
        {activeModal === 'embed' && <EmbedMapModal />}
        {activeModal === 'export-gpx' && <ExportGpxModal />}
        {activeModal === 'tips' && <TipsModal />}
        {showLoginModal && <LoginModal />}

        <Map
          zoomControl={false}
          minZoom={8}
          maxZoom={20}
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
          <ScaleControl imperial={false} position="bottomleft" />
          <Layers />

          {showMenu &&
            <span>
              <SearchResults />
              <ObjectsResult />
              <RoutePlannerResult />
              <DistanceMeasurementResult />
              <ElevationMeasurementResult />
              <AreaMeasurementResult />
              <LocationResult />
              <TrackViewerResult />
              <InfoPoint />
              <ChangesetsResult />
              {tool === 'map-details' && <MapDetails />}
              {showElevationChart && <AsyncElevationChart />}
              {showGalleryPicker && <GalleryPicker />}
            </span>
          }
          <GalleryResult />{/* TODO should not be extra just because for position picking */}
        </Map>
      </div>,
    ];
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
    user: state.auth.user,
    ignoreEscape: !!(state.main.activeModal && state.main.activeModal !== 'settings' // TODO settings dialog gets also closed
      || state.gallery.activeImageId || state.gallery.showPosition),
    showElevationChart: !!state.elevationChart.elevationProfilePoints,
    showGalleryPicker: isShowGalleryPicker(state),
    locate: state.main.locate,
    showLoginModal: state.auth.chooseLoginMethod,
    showMenu: !state.main.selectingHomeLocation && !state.gallery.pickingPositionForId && !state.gallery.showPosition,
  }),
  dispatch => ({
    onToolSet(tool) {
      dispatch(setTool(tool));
    },
    onMapRefocus(changes) {
      dispatch(mapRefocus(changes));
    },
    onLocationSet(lat, lon, accuracy) {
      dispatch(setLocation(lat, lon, accuracy));
    },
    onCheckLogin() {
      dispatch(authCheckLogin());
    },
    onMapClear() {
      dispatch(clearMap());
    },
    onMapReset() {
      dispatch(mapReset());
    },
    onLocate() {
      dispatch(toggleLocate());
    },
  }),
)(Main);

function handleMapClick({ latlng: { lat, lng: lon } }) {
  mapEventEmitter.emit('mapClick', lat, lon);
}

function handleMapMouseMove({ latlng: { lat, lng: lon }, originalEvent }) {
  mapEventEmitter.emit('mouseMove', lat, lon, originalEvent);
}

function handleMapMouseOver({ latlng: { lat, lng: lon } }) {
  mapEventEmitter.emit('mouseOver', lat, lon);
}

function handleMapMouseOut({ latlng: { lat, lng: lon } }) {
  mapEventEmitter.emit('mouseOut', lat, lon);
}

function selectMouseCursor(state) {
  if (state.main.selectingHomeLocation) {
    return 'crosshair';
  }
  switch (state.main.tool) {
    case 'measure-dist':
    case 'measure-ele':
    case 'measure-area':
    case 'map-details':
    case 'route-planner':
    case 'info-point':
      return state.routePlanner.pickMode ? 'crosshair' : 'auto';
    default:
      return isShowGalleryPicker(state) ? 'crosshair' : 'auto';
  }
}

function isShowGalleryPicker(state) {
  return (state.main.tool === null || ['gallery', 'track-viewer', 'search', 'objects', 'changesets'].includes(state.main.tool))
    && state.map.overlays.includes('I')
    && state.gallery.pickingPositionForId === null
    && !state.gallery.showPosition
    && !state.main.selectingHomeLocation;
}
