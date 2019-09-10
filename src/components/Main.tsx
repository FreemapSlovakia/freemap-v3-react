import 'fm3/bootstrap/css/bootstrap.css';
import 'leaflet/dist/leaflet.css';

import React from 'react';
import { Map, ScaleControl } from 'react-leaflet';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Button from 'react-bootstrap/lib/Button';
import CloseButton from 'react-bootstrap/lib/CloseButton';
import Panel from 'react-bootstrap/lib/Panel';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Popover from 'react-bootstrap/lib/Popover';

import { withTranslator, Translator } from 'fm3/l10nInjector';

import Layers from 'fm3/components/Layers';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import Toasts from 'fm3/components/Toasts';

import SearchMenu from 'fm3/components/SearchMenu';
import SearchResults from 'fm3/components/SearchResults';

import ObjectsMenu from 'fm3/components/ObjectsMenu';
import { ObjectsResult } from 'fm3/components/ObjectsResult';

import MeasurementMenu from 'fm3/components/MeasurementMenu';
import DistanceMeasurementResult from 'fm3/components/DistanceMeasurementResult';
import AreaMeasurementResult from 'fm3/components/AreaMeasurementResult';
import ElevationMeasurementResult from 'fm3/components/ElevationMeasurementResult';
import LocationResult from 'fm3/components/LocationResult';

import RoutePlannerMenu from 'fm3/components/RoutePlannerMenu';
import RoutePlannerResult from 'fm3/components/RoutePlannerResult';

import TrackViewerMenu from 'fm3/components/TrackViewerMenu';
import TrackViewerResult from 'fm3/components/TrackViewerResult';
import TrackViewerUploadModal from 'fm3/components/TrackViewerUploadModal';
import TrackViewerShareModal from 'fm3/components/TrackViewerShareModal';

import GalleryMenu from 'fm3/components/gallery/GalleryMenu';
import GalleryResult from 'fm3/components/gallery/GalleryResult';
import GalleryPicker from 'fm3/components/gallery/GalleryPicker';
import GalleryPositionPickingMenu from 'fm3/components/gallery/GalleryPositionPickingMenu';
import GalleryShowPositionMenu from 'fm3/components/gallery/GalleryShowPositionMenu';

import Settings from 'fm3/components/Settings';
import HomeLocationPickingMenu from 'fm3/components/HomeLocationPickingMenu';

import OpenInExternalAppMenuButton from 'fm3/components/OpenInExternalAppMenuButton';
import ToolsMenuButton from 'fm3/components/ToolsMenuButton';
import MapSwitchButton from 'fm3/components/MapSwitchButton';
import MoreMenuButton from 'fm3/components/MoreMenuButton';

import AsyncElevationChart from 'fm3/components/AsyncElevationChart';

import InfoPointMenu from 'fm3/components/InfoPointMenu';
import InfoPointResult from 'fm3/components/InfoPointResult';
import InfoPointLabelModal from 'fm3/components/InfoPointLabelModal';

import ChangesetsMenu from 'fm3/components/ChangesetsMenu';
import ChangesetsResult from 'fm3/components/ChangesetsResult';

import MapDetailsMenu from 'fm3/components/MapDetailsMenu';

import ShareMapModal from 'fm3/components/ShareMapModal';
import EmbedMapModal from 'fm3/components/EmbedMapModal';
import ExportGpxModal from 'fm3/components/ExportGpxModal';
import ExportPdfModal from 'fm3/components/ExportPdfModal';
import LoginModal from 'fm3/components/LoginModal';
import TipsModal from 'fm3/components/TipsModal';
import AboutModal from 'fm3/components/AboutModal';
import SupportUsModal from 'fm3/components/SupportUsModal';
import AsyncLegendModal from 'fm3/components/AsyncLegendModal';

import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

import { mapRefocus, mapReset, MapViewState } from 'fm3/actions/mapActions';
import {
  setTool,
  setLocation,
  clearMap,
  toggleLocate,
  Tool,
} from 'fm3/actions/mainActions';
import { authCheckLogin } from 'fm3/actions/authActions';

import { setMapLeafletElement } from 'fm3/leafletElementHolder';
import Attribution from 'fm3/components/Attribution';

import 'fm3/styles/main.scss';
import 'fm3/styles/leaflet.scss';
import TrackingModal from 'fm3/components/tracking/TrackingModal';
import TrackingResult from 'fm3/components/tracking/TrackingResult';
import TrackingMenu from 'fm3/components/tracking/TrackingMenu.tsx';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';
import { LeafletMouseEvent, LocationEvent } from 'leaflet';

import fmLogo from '../images/freemap-logo-print.png';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

interface State {
  showInfoBar: boolean;
}

class MainInt extends React.Component<Props, State> {
  state: State = {
    showInfoBar: true,
  };

  map: Map | null = null;

  componentDidMount() {
    this.props.onCheckLogin();

    setMapLeafletElement(this.map ? this.map.leafletElement : null);
    document.addEventListener('keydown', event => {
      const embed = window.self !== window.top;
      if (
        !embed &&
        event.keyCode === 27 /* escape key */ &&
        !this.props.ignoreEscape
      ) {
        this.props.onToolSet(null);
      }
    });

    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
  }

  componentWillUnmount() {
    document.removeEventListener(
      'fullscreenchange',
      this.handleFullscreenChange,
    );
    setMapLeafletElement(null);
  }

  handleFullscreenChange = () => {
    this.forceUpdate();
  };

  handleMapMoveEnd = () => {
    // TODO analyze why this can be null
    if (!this.map) {
      return;
    }

    const map = this.map.leafletElement;
    const { lat, lng: lon } = map.getCenter();
    const zoom = map.getZoom();

    if (
      this.props.lat !== lat ||
      this.props.lon !== lon ||
      this.props.zoom !== zoom
    ) {
      this.props.onMapRefocus({ lat, lon, zoom });
    }
  };

  handleLocationFound = (e: LocationEvent) => {
    this.props.onLocationSet(e.latlng.lat, e.latlng.lng, e.accuracy);
  };

  handleEmbedLogoClick = () => {
    window.open(window.location.href, '_blank');
  };

  handleToolCloseClick = () => {
    this.props.onToolSet(null);
  };

  handleFullscreenClick = () => {
    if (!document.exitFullscreen) {
      // undupported
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.body.requestFullscreen();
    }
  };

  handleZoomInClick = () => {
    if (this.map) {
      const zoom = this.map.leafletElement.getZoom() + 1;
      this.props.onMapRefocus({ zoom });
    }
  };

  handleZoomOutClick = () => {
    if (this.map) {
      const zoom = this.map.leafletElement.getZoom() - 1;
      this.props.onMapRefocus({ zoom });
    }
  };

  handleInfoBarCloseClick = () => {
    this.setState({
      showInfoBar: false,
    });
  };

  render() {
    const {
      lat,
      lon,
      zoom,
      mapType,
      tool,
      activeModal,
      progress,
      mouseCursor,
      showElevationChart,
      showGalleryPicker,
      onMapClear,
      showLoginModal,
      onMapReset,
      showMenu,
      expertMode,
      t,
      overlayPaneOpacity,
      embedFeatures,
      overlays,
      imhd,
    } = this.props;

    const embed = window.self !== window.top;

    return (
      <>
        <style>
          {`.leaflet-overlay-pane { opacity: ${overlayPaneOpacity} }`}
        </style>

        {/* see https://stackoverflow.com/questions/24680588/load-external-images-in-print-media why we must allways fetch the image :-( */}
        <img
          id="freemap-logo-print"
          src={fmLogo}
          width="150"
          height="54"
          alt="freemap logo"
          style={{ display: 'none' }}
        />

        <Toasts />

        <div className="header">
          {process.env.DEPLOYMENT === 'next' && this.state.showInfoBar && (
            <div className="info-bar">
              <CloseButton onClick={this.handleInfoBarCloseClick} />
              {t('main.devInfo')}
            </div>
          )}
          <div className="menus">
            {embed ? (
              <>
                <Panel className="fm-toolbar">
                  <Button
                    id="freemap-logo"
                    className={progress ? 'in-progress' : 'idle'}
                    onClick={this.handleEmbedLogoClick}
                  />
                  {embedFeatures.includes('search') && (
                    <SearchMenu
                      hidden={!showMenu}
                      preventShortcut={!!activeModal}
                    />
                  )}
                </Panel>
              </>
            ) : (
              <>
                <Panel className="fm-toolbar">
                  <Button
                    id="freemap-logo"
                    className={progress ? 'in-progress' : 'idle'}
                    onClick={onMapReset}
                  />
                  <SearchMenu
                    hidden={!showMenu}
                    preventShortcut={!!activeModal}
                  />
                </Panel>
                {showMenu && (
                  <Panel className={`fm-toolbar${tool ? ' hidden-xs' : ''}`}>
                    <ButtonToolbar>
                      <ButtonGroup>
                        <ToolsMenuButton />
                        <Button onClick={onMapClear} title={t('main.clearMap')}>
                          <FontAwesomeIcon icon="eraser" />
                        </Button>
                        {document.exitFullscreen && (
                          <Button
                            onClick={this.handleFullscreenClick}
                            title={
                              document.fullscreenElement
                                ? t('general.exitFullscreen')
                                : t('general.fullscreen')
                            }
                          >
                            <FontAwesomeIcon
                              icon={
                                document.fullscreenElement
                                  ? 'compress'
                                  : 'expand'
                              }
                            />
                          </Button>
                        )}
                        <OpenInExternalAppMenuButton
                          lat={lat}
                          lon={lon}
                          zoom={zoom}
                          mapType={mapType}
                          expertMode={expertMode}
                        />
                        <MoreMenuButton />
                      </ButtonGroup>
                    </ButtonToolbar>
                  </Panel>
                )}
              </>
            )}
            {showMenu && tool && (
              <Panel className="fm-toolbar">
                {tool === 'objects' && <ObjectsMenu />}
                {tool === 'route-planner' && <RoutePlannerMenu />}
                {['measure-dist', 'measure-ele', 'measure-area'].includes(
                  tool,
                ) && <MeasurementMenu />}
                {tool === 'track-viewer' && <TrackViewerMenu />}
                {tool === 'info-point' && <InfoPointMenu />}
                {tool === 'changesets' && <ChangesetsMenu />}
                {tool === 'gallery' && <GalleryMenu />}
                {tool === 'map-details' && <MapDetailsMenu />}
                {tool === 'tracking' && <TrackingMenu />}
                {!embed && (
                  <>
                    {' '}
                    <Button
                      onClick={this.handleToolCloseClick}
                      title={t('main.closeTool')}
                    >
                      <FontAwesomeIcon icon="close" />
                      <span className="hidden-xs"> {t('main.close')}</span>
                    </Button>
                  </>
                )}
              </Panel>
            )}
            <GalleryPositionPickingMenu />
            <GalleryShowPositionMenu />
            <HomeLocationPickingMenu />
          </div>
        </div>

        <div className="fm-type-zoom-control">
          <Panel
            className="fm-toolbar"
            style={{ float: 'right', marginRight: '10px' }}
          >
            <ButtonToolbar>
              <OverlayTrigger
                trigger="click"
                rootClose
                placement="top"
                overlay={
                  <Popover
                    id="popover-positioned-right"
                    className="fm-attr-popover"
                  >
                    <Attribution
                      t={t}
                      mapType={mapType}
                      overlays={overlays}
                      imhd={imhd}
                    />
                  </Popover>
                }
              >
                <Button title={t('main.copyright')}>
                  <FontAwesomeIcon icon="copyright" />
                </Button>
              </OverlayTrigger>
            </ButtonToolbar>
          </Panel>
          <Panel className="fm-toolbar">
            <ButtonToolbar>
              {(!embed || !embedFeatures.includes('noMapSwitch')) && (
                <MapSwitchButton />
              )}
              <ButtonGroup>
                <Button
                  onClick={this.handleZoomInClick}
                  title={t('main.zoomIn')}
                  disabled={
                    !!this.map &&
                    this.props.zoom >= this.map.leafletElement.getMaxZoom()
                  }
                >
                  <FontAwesomeIcon icon="plus" />
                </Button>
                <Button
                  onClick={this.handleZoomOutClick}
                  title={t('main.zoomOut')}
                  disabled={
                    !!this.map &&
                    this.props.zoom <= this.map.leafletElement.getMinZoom()
                  }
                >
                  <FontAwesomeIcon icon="minus" />
                </Button>
              </ButtonGroup>
              {(!embed || !embedFeatures.includes('noLocateMe')) && (
                <Button
                  onClick={this.props.onLocate}
                  title={t('main.locateMe')}
                  active={this.props.locate}
                >
                  <FontAwesomeIcon icon="dot-circle-o" />
                </Button>
              )}
            </ButtonToolbar>
          </Panel>
        </div>

        {activeModal === 'settings' && <Settings />}
        {activeModal &&
          ['tracking-my', 'tracking-watched'].includes(activeModal) && (
            <TrackingModal />
          )}
        {activeModal === 'share' && <ShareMapModal />}
        {activeModal === 'embed' && <EmbedMapModal />}
        {activeModal === 'export-gpx' && <ExportGpxModal />}
        {activeModal === 'export-pdf' && <ExportPdfModal />}
        {activeModal === 'tips' && <TipsModal />}
        {activeModal === 'about' && <AboutModal />}
        {activeModal === 'supportUs' && <SupportUsModal />}
        {activeModal === 'legend' && <AsyncLegendModal />}
        {activeModal === 'info-point-change-label' && <InfoPointLabelModal />}
        {activeModal === 'upload-track' && <TrackViewerUploadModal />}
        {activeModal === 'track-viewer-share' && <TrackViewerShareModal />}
        {showLoginModal && <LoginModal />}

        <Map
          zoomControl={false}
          attributionControl={false}
          maxZoom={20}
          ref={map => {
            this.map = map;
          }}
          center={{ lat, lng: lon }}
          zoom={zoom}
          onmoveend={this.handleMapMoveEnd}
          onmousemove={handleMapMouseMove}
          onmouseover={handleMapMouseOver}
          onmouseout={handleMapMouseOut}
          onclick={handleMapClick}
          onlocationfound={this.handleLocationFound}
          style={{ cursor: mouseCursor }}
        >
          <ScaleControl imperial={false} position="bottomleft" />
          <Layers />

          {showMenu && (
            <>
              <SearchResults />
              <ObjectsResult />
              <RoutePlannerResult />
              <DistanceMeasurementResult />
              <ElevationMeasurementResult />
              <AreaMeasurementResult />
              <LocationResult />
              <TrackViewerResult />
              <InfoPointResult />
              <ChangesetsResult />
              <TrackingResult />
              {showElevationChart && <AsyncElevationChart />}
              {showGalleryPicker && <GalleryPicker />}
            </>
          )}
          <GalleryResult />
          {/* TODO should not be extra just because for position picking */}
        </Map>
      </>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  lat: state.map.lat,
  lon: state.map.lon,
  zoom: state.map.zoom,
  tool: state.main.tool,
  embedFeatures: state.main.embedFeatures,
  mapType: state.map.mapType,
  activeModal: state.main.activeModal,
  progress: !!state.main.progress.length,
  mouseCursor: selectMouseCursor(state),
  user: state.auth.user,
  ignoreEscape: !!(
    (state.main.activeModal && state.main.activeModal !== 'settings') || // TODO settings dialog gets also closed
    state.gallery.activeImageId ||
    state.gallery.showPosition
  ),
  showElevationChart: !!state.elevationChart.elevationProfilePoints,
  showGalleryPicker: isShowGalleryPicker(state),
  locate: state.main.locate,
  showLoginModal: state.auth.chooseLoginMethod,
  showMenu:
    !state.main.selectingHomeLocation &&
    !state.gallery.pickingPositionForId &&
    !state.gallery.showPosition,
  expertMode: state.main.expertMode,
  overlayPaneOpacity: state.map.overlayPaneOpacity,
  overlays: state.map.overlays,
  imhd: state.routePlanner.transportType === 'imhd',
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onToolSet(tool: Tool | null) {
    dispatch(setTool(tool));
  },
  onMapRefocus(changes: Partial<MapViewState>) {
    dispatch(mapRefocus(changes));
  },
  onLocationSet(lat: number, lon: number, accuracy: number) {
    dispatch(setLocation({ lat, lon, accuracy }));
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
});

export const Main = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(MainInt));

function handleMapClick(e: LeafletMouseEvent) {
  // see https://github.com/FreemapSlovakia/freemap-v3-react/issues/168
  if (!window.preventMapClick) {
    mapEventEmitter.emit('mapClick', e.latlng.lat, e.latlng.lng);
  }
}

function handleMapMouseMove(e: LeafletMouseEvent) {
  mapEventEmitter.emit(
    'mouseMove',
    e.latlng.lat,
    e.latlng.lng,
    e.originalEvent,
  );
}

function handleMapMouseOver(e: LeafletMouseEvent) {
  mapEventEmitter.emit('mouseOver', e.latlng.lat, e.latlng.lng);
}

function handleMapMouseOut(e: LeafletMouseEvent) {
  mapEventEmitter.emit('mouseOut', e.latlng.lat, e.latlng.lng);
}

function selectMouseCursor(state: RootState) {
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

function isShowGalleryPicker(state: RootState) {
  return (
    (state.main.tool === null ||
      ['gallery', 'track-viewer', 'objects', 'changesets'].includes(
        state.main.tool,
      )) &&
    state.map.overlays.includes('I') &&
    state.gallery.pickingPositionForId === null &&
    !state.gallery.showPosition &&
    !state.main.selectingHomeLocation
  );
}
