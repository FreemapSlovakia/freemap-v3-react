import React from 'react';
import { Map } from 'react-leaflet';
import { connect } from 'react-redux';
import { ToastContainer, ToastMessage } from 'react-toastr';

import Navbar from 'react-bootstrap/lib/Navbar';
import Row from 'react-bootstrap/lib/Row';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';

import Search from 'fm3/components/Search';
import SearchResults from 'fm3/components/SearchResults';
import ObjectsModal from 'fm3/components/ObjectsModal';
import Layers from 'fm3/components/Layers';
import Measurement from 'fm3/components/Measurement';
import ElevationMeasurement from 'fm3/components/ElevationMeasurement';
import RoutePlanner from 'fm3/components/RoutePlanner';
import RoutePlannerResults from 'fm3/components/RoutePlannerResults';
import ObjectsResult from 'fm3/components/ObjectsResult';

import { setTool, resetMap, setMapBounds, refocusMap, setMapType, setMapOverlays } from 'fm3/actions/mapActions';
import { showObjectsModal } from 'fm3/actions/objectsActions';

import 'fm3/styles/main.scss';

const ToastMessageFactory = React.createFactory(ToastMessage.animation);

class Main extends React.Component {

  componentWillMount() {
    this.setupMapFromUrl(this.props.params);
  }

  componentWillReceiveProps(newProps) {
    this.setupMapFromUrl(newProps.params);
  }

  setupMapFromUrl(params) {
    const layersOK = /^[ATCK]I?$/.test(params.mapType);
    const layers = layersOK ? params.mapType : 'T';
    const mapType = layers.charAt(0);
    const overlays = layers.length > 1 ? layers.substring(1).split('') : [];

    if (!layersOK || mapType !== this.props.mapType) {
      this.props.onSetMapType(mapType);
    }

    if (!layersOK || overlays.join('') !== this.props.overlays.join('')) {
      this.props.onSetMapOverlays(overlays);
    }

    const zoom = parseInt(params.zoom);
    const lat = parseFloat(params.lat);
    const lon = parseFloat(params.lon);

    this.refocusMap2(lat, lon, zoom);
  }

  refocusMap({ target }) {
    const { lat, lng: lon } = target.getCenter();
    const zoom = target.getZoom();
    this.refocusMap2(lat, lon, zoom);
  }

  refocusMap2(lat, lon, zoom) {
    const { center: { lat: oldLat, lon: oldLon }, zoom: oldZoom } = this.props;
    if (isNaN(lat) || isNaN(lon) || isNaN(zoom) ||
        Math.abs(lat - oldLat) > 0.000001 || Math.abs(lon - oldLon) > 0.000001 || zoom !== oldZoom) {
      this.props.onMapRefocus(lat || 48.70714, lon || 19.4995, zoom || 8);
      this.handleMapBoundsChanged();
    }
  }

  // TODO there may be more map events which changes map bounds. eg "resize". Implement.
  handleMapBoundsChanged() {
    if (this.map) { // FIXME this is sometimes null (if changed url manually)
      const b = this.map.leafletElement.getBounds();
      this.props.onMapBoundsChange({
        south: b.getSouth(),
        west: b.getWest(),
        north: b.getNorth(),
        east: b.getEast()
      });
    }
  }

  handleMapTypeChange(mapType) {
    if (this.props.mapType !== mapType) {
      this.props.onSetMapType(mapType);
    }
  }

  handleOverlayChange(overlays) {
    this.props.onSetMapOverlays(overlays);
  }

  handleMapClick({ latlng: { lat, lng: lon } }) {
    if (this.measurement) {
      this.measurement.getWrappedInstance().handlePointAdded({ lat, lon });
    }

    if (this.elevationMeasurement) {
      this.elevationMeasurement.getWrappedInstance().handlePointAdded({ lat, lon });
    }

    if (this.routePlanner) {
      this.routePlanner.getWrappedInstance().handlePointAdded({ lat, lon });
    }
  }

  handlePoiSearch() {
    if (this.props.zoom < 12) {
      this.refs.toastContainer.info(
        "Vyhľadávanie POIs funguje až od zoom úrovne 12",
        null,
        { timeOut: 3000, showAnimation: 'animated fadeIn', hideAnimation: 'animated fadeOut' }
      );
    } else {
      this.props.onShowObjectsModal();
    }
  }

  showDefaltMainMenuActions() {
    return this.props.tool !== 'route-planner' && this.props.tool !== 'search';
  }

  render() {
    const { tool, onResetMap, onSetTool, objectsModalShown } = this.props;
    const b = (fn, ...args) => fn.bind(this, ...args);

    return (
      <div className="container-fluid">
        {objectsModalShown && <ObjectsModal/>}

        <Row>
          <Navbar fluid style={{ marginBottom: 0 }}>
            <Navbar.Header>
              <Navbar.Brand>
                <img onClick={b(onResetMap)}
                  className="freemap-logo"
                  src={require('fm3/images/freemap-logo.png')}/>
              </Navbar.Brand>
              <Navbar.Toggle/>
            </Navbar.Header>

            <Navbar.Collapse>
              {( this.showDefaltMainMenuActions() || tool === 'search' ) &&
                <Search/>
              }
              {this.showDefaltMainMenuActions() &&
                <Nav>
                  <NavItem onClick={b(this.handlePoiSearch)}>
                    <i className={`fa fa-star`} aria-hidden="true"/> Hľadať POIs
                  </NavItem>
                  <NavItem onClick={b(onSetTool, 'measure')} active={tool === 'measure'}>
                    <i className={`fa fa-arrows-h`} aria-hidden="true"/> Meranie vzdialenosti
                  </NavItem>
                  <NavItem onClick={b(onSetTool, 'route-planner')} active={tool === 'route-planner'}>
                    <i className={`fa fa-map-signs`} aria-hidden="true"/> Plánovač trasy
                  </NavItem>
                  <NavItem onClick={b(onSetTool, 'measure-ele')} active={tool === 'measure-ele'}>
                    <i className={`fa fa-area-chart`} aria-hidden="true"/> Výškomer
                  </NavItem>
                </Nav>
              }
              {tool === 'route-planner' && <RoutePlanner/>}
            </Navbar.Collapse>
          </Navbar>
        </Row>
        <Row className={`tool-${tool || 'none'} active-map-type-${this.props.mapType}`}>
          <Map
            ref={map => this.map = map}
            center={L.latLng(this.props.center.lat, this.props.center.lon)}
            zoom={this.props.zoom}
            onMoveend={b(this.refocusMap)}
            onZoom={b(this.refocusMap)}
            onClick={b(this.handleMapClick)}
          >
            <Layers
              mapType={this.props.mapType} onMapChange={b(this.handleMapTypeChange)}
              overlays={this.props.overlays} onOverlaysChange={b(this.handleOverlayChange)}
            />

            <SearchResults/>

            <ObjectsResult/>

            {tool === 'route-planner' && <RoutePlannerResults ref={e => this.routePlanner = e}/>}

            {tool === 'measure' && <Measurement ref={e => this.measurement = e}/>}

            {tool === 'measure-ele' && <ElevationMeasurement ref={e => this.elevationMeasurement = e}/>}
          </Map>
        </Row>

        <ToastContainer
          ref="toastContainer"
          toastMessageFactory={ToastMessageFactory}
          className="toast-top-right"/>
      </div>
    );
  }
}

Main.propTypes = {
  center: React.PropTypes.object,
  zoom: React.PropTypes.number,
  params: React.PropTypes.object,
  tool: React.PropTypes.string,
  mapType: React.PropTypes.string,
  overlays: React.PropTypes.array,
  onSetTool: React.PropTypes.func.isRequired,
  onResetMap: React.PropTypes.func.isRequired,
  objectsModalShown: React.PropTypes.bool,
  onShowObjectsModal: React.PropTypes.func.isRequired,
  onMapBoundsChange: React.PropTypes.func.isRequired,
  onMapRefocus: React.PropTypes.func.isRequired,
  onSetMapType: React.PropTypes.func.isRequired,
  onSetMapOverlays: React.PropTypes.func.isRequired
};

export default connect(
  function (state) {
    return {
      center: state.map.center,
      zoom: state.map.zoom,
      tool: state.map.tool,
      objectsModalShown: state.objects.objectsModalShown,
      mapType: state.map.mapType,
      overlays: state.map.overlays
    };
  },
  function (dispatch) {
    return {
      onSetTool(tool) {
        dispatch(setTool(tool));
      },
      onResetMap() {
        dispatch(resetMap());
      },
      onShowObjectsModal() {
        dispatch(showObjectsModal());
      },
      onMapBoundsChange(bounds) {
        dispatch(setMapBounds(bounds));
      },
      onMapRefocus(lat, lon, zoom) {
        dispatch(refocusMap(lat, lon, zoom));
      },
      onSetMapType(mapType) {
        dispatch(setMapType(mapType));
      },
      onSetMapOverlays(overlays) {
        dispatch(setMapOverlays(overlays));
      }
    };
  }
)(Main);
