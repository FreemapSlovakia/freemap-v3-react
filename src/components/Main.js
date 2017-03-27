import React from 'react';
import { Map, ScaleControl } from 'react-leaflet';
import { connect } from 'react-redux';
import { ToastContainer, ToastMessage } from 'react-toastr';
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

import SearchMenu from 'fm3/components/SearchMenu';
import SearchResults from 'fm3/components/SearchResults';

import ObjectsMenu from 'fm3/components/ObjectsMenu';
import ObjectsResult from 'fm3/components/ObjectsResult';

import MeasurementMenu from 'fm3/components/MeasurementMenu';
import DistanceMeasurementResult from 'fm3/components/DistanceMeasurementResult';
import AreaMeasurementResult from 'fm3/components/AreaMeasurementResult';
import ElevationMeasurementResult from 'fm3/components/ElevationMeasurementResult';

import RoutePlannerMenu from 'fm3/components/RoutePlannerMenu';
import RoutePlannerResult from 'fm3/components/RoutePlannerResult';
import Settings from 'fm3/components/Settings';

import * as FmPropTypes from 'fm3/propTypes';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

import { mapRefocus } from 'fm3/actions/mapActions';
import { setTool, setActivePopup } from 'fm3/actions/mainActions';

import { baseLayers, overlayLayers } from 'fm3/mapDefinitions';
import { setLeafletElement } from 'fm3/leafletElementHolder';

import 'fm3/styles/main.scss';

const ToastMessageFactory = React.createFactory(ToastMessage.animation);

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
  };

  componentWillMount() {
    // set redux according to URL
    this.props.onMapRefocus(getMapDiff(this.props));
  }

  componentDidMount() {
    setLeafletElement(this.map.leafletElement);
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
    setLeafletElement(null);
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

  showToast = (toastType, line1, line2) => {
    this.toastContainer[toastType](
      line2,
      line1, // sic!
      { timeOut: 3000, showAnimation: 'animated fadeIn', hideAnimation: 'animated fadeOut' },
    );
  }

  handleToolSet(tool) {
    this.props.onSetTool(this.props.tool === tool ? null : tool); // toggle tool
  }

  render() {
    const { tool, tileFormat, activePopup, onLaunchPopup, progress } = this.props;
    const showDefaultMenu = [null, 'select-home-location'].indexOf(tool) !== -1;

    return (
      <div className="container-fluid">
        <Row>
          <Navbar fluid style={{ marginBottom: 0 }}>
            <NavbarHeader />
            <Navbar.Collapse>
              {tool === 'objects' && <ObjectsMenu onShowToast={this.showToast} />}
              {(showDefaultMenu || tool === 'search') && <SearchMenu />}
              {tool === 'route-planner' && <RoutePlannerMenu onShowToast={this.showToast} />}
              {(tool === 'measure' || tool === 'measure-ele' || tool === 'measure-area') && <MeasurementMenu />}
              {activePopup === 'settings' && <Settings onShowToast={this.showToast} />}
              {showDefaultMenu &&
                <Nav key="nav">
                  <NavItem onClick={() => this.handleToolSet('objects')}>
                    <FontAwesomeIcon icon="map-marker" /> Miesta
                  </NavItem>
                  <NavItem onClick={() => this.handleToolSet('route-planner')}>
                    <FontAwesomeIcon icon="map-signs" /> Plánovač
                  </NavItem>
                  <NavItem onClick={() => this.handleToolSet('measure')}>
                    <FontAwesomeIcon icon="arrows-h" /> Meranie
                  </NavItem>
                </Nav>
              }
              {showDefaultMenu &&
                <Nav pullRight>
                  <NavDropdown title="Viac" id="additional-menu-items">
                    <MenuItem onClick={() => onLaunchPopup('settings')}><FontAwesomeIcon icon="cog" /> Nastavenia</MenuItem>
                    <MenuItem divider />
                    <MenuItem onClick={() => window.open('http://wiki.freemap.sk/NahlasenieChyby')}><FontAwesomeIcon icon="exclamation-triangle" /> Nahlás chybu</MenuItem>
                  </NavDropdown>
                </Nav>
              }
            </Navbar.Collapse>
          </Navbar>
        </Row>
        <Row>
          <ProgressIndicator active={progress} />
        </Row>
        <Row className={`map-holder tool-${tool || 'none'} active-map-type-${this.props.mapType}`}>
          <Map
            ref={(map) => { this.map = map; }}
            center={L.latLng(this.props.lat, this.props.lon)}
            zoom={this.props.zoom}
            onMoveend={this.handleMapMoveEnd}
            onClick={handleMapClick}
          >
            <Layers
              mapType={this.props.mapType} onMapChange={this.handleMapTypeChange}
              overlays={this.props.overlays} onOverlaysChange={this.handleOverlayChange}
              tileFormat={tileFormat} overlayOpacity={this.props.overlayOpacity}
            />

            <ScaleControl imperial={false} position="bottomright" />

            {(showDefaultMenu || tool === 'search') && <SearchResults />}

            {tool === 'objects' && <ObjectsResult />}

            {tool === 'route-planner' && <RoutePlannerResult onShowToast={this.showToast} />}

            {tool === 'measure' && <DistanceMeasurementResult />}

            {tool === 'measure-ele' && <ElevationMeasurementResult />}

            {tool === 'measure-area' && <AreaMeasurementResult onShowToast={this.showToast} />}
          </Map>
        </Row>

        <ToastContainer
          ref={(toastContainer) => { this.toastContainer = toastContainer; }}
          toastMessageFactory={ToastMessageFactory}
          className="toast-top-right"
        />
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
