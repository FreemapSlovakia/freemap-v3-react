import React from 'react';
import { Map } from 'react-leaflet';
import { connect } from 'react-redux';
import { ToastContainer, ToastMessage } from 'react-toastr';

import Navbar from 'react-bootstrap/lib/Navbar';
import Row from 'react-bootstrap/lib/Row';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import NavDropdown from 'react-bootstrap/lib/NavDropdown';
import MenuItem from 'react-bootstrap/lib/MenuItem';

import Search from 'fm3/components/Search';
import SearchResults from 'fm3/components/SearchResults';
import Objects from 'fm3/components/Objects';
import Layers from 'fm3/components/Layers';
import Measurement from 'fm3/components/Measurement';
import ElevationMeasurement from 'fm3/components/ElevationMeasurement';
import RoutePlanner from 'fm3/components/RoutePlanner';
import RoutePlannerResults from 'fm3/components/RoutePlannerResults';
import ObjectsResult from 'fm3/components/ObjectsResult';
import Settings from 'fm3/components/Settings';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

import { setTool, resetMap, setMapBounds, refocusMap, setMapType, setMapOverlays } from 'fm3/actions/mapActions';

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

  handleMapMoveEnd() {
    this.changeMapBounds();
    this.refocusMap();
  }

  handleMapZoom() {
    this.changeMapBounds();
    this.refocusMap();
  }

  refocusMap() {
    const map = this.refs.map.leafletElement;
    const { lat, lng: lon } = map.getCenter();
    const zoom = map.getZoom();
    this.refocusMap2(lat, lon, zoom);
  }

  refocusMap2(lat, lon, zoom) {
    const { center: { lat: oldLat, lon: oldLon }, zoom: oldZoom } = this.props;
    if (isNaN(lat) || isNaN(lon) || isNaN(zoom) ||
        Math.abs(lat - oldLat) > 0.000001 || Math.abs(lon - oldLon) > 0.000001 || zoom !== oldZoom) {
      this.props.onMapRefocus(lat || 48.70714, lon || 19.4995, zoom || 8);
    }
  }

  // TODO there may be more map events which changes map bounds. eg "resize". Implement.
  changeMapBounds() {
    const b = this.refs.map.leafletElement.getBounds();
    this.props.onMapBoundsChange({
      south: b.getSouth(),
      west: b.getWest(),
      north: b.getNorth(),
      east: b.getEast()
    });
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
      this.showToast('info', null, "Vyhľadávanie POIs funguje až od zoom úrovne 12");
    } else {
      this.props.onSetTool('objects');
    }
  }

  showToast(toastType, line1, line2) {
    this.refs.toastContainer[toastType](
      line2,
      line1, // sic!
      { timeOut: 3000, showAnimation: 'animated fadeIn', hideAnimation: 'animated fadeOut' }
    );
  }

  handleToolSet(tool) {
    this.props.onSetTool(this.props.tool === tool ? null : tool); // toggle tool
  }

  render() {
    const { tool, onResetMap } = this.props;
    const b = (fn, ...args) => fn.bind(this, ...args);

    return (
      <div className="container-fluid">
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
              {tool === 'objects' && <Objects/>}
              {tool !== 'objects' && tool !== 'route-planner' && <Search/>}
              {tool === 'route-planner' && <RoutePlanner/>}
              {tool === 'settings' && <Settings/>}
              {tool !== 'search' && tool !== 'objects' && tool !== 'route-planner' &&
                <div>
                  <Nav key='nav'>
                    <NavItem onClick={b(this.handlePoiSearch)} active={tool === 'objects'}>
                    <FontAwesomeIcon icon="star" /> Hľadať POIs
                    </NavItem>
                    <NavItem onClick={b(this.handleToolSet, 'route-planner')} active={tool === 'route-planner'}>
                      <FontAwesomeIcon icon="map-signs" /> Plánovač trasy
                    </NavItem>
                    <NavItem onClick={b(this.handleToolSet, 'measure')} active={tool === 'measure'}>
                      <FontAwesomeIcon icon="arrows-h" /> Meranie vzdialenosti
                    </NavItem>
                    <NavItem onClick={b(this.handleToolSet, 'measure-ele')} active={tool === 'measure-ele'}>
                      <FontAwesomeIcon icon="area-chart" /> Výškomer
                    </NavItem>
                  </Nav>
                  <Nav pullRight>
                    <NavDropdown title="Viac" id="additional-menu-items">
                      <MenuItem onClick={b(this.handleToolSet, 'settings')}><FontAwesomeIcon icon="cog" /> Nastavenia</MenuItem>
                    </NavDropdown>
                  </Nav>
                </div>
              }
            </Navbar.Collapse>
          </Navbar>
        </Row>
        <Row className={`tool-${tool || 'none'} active-map-type-${this.props.mapType}`}>
          <Map
            ref="map"
            center={L.latLng(this.props.center.lat, this.props.center.lon)}
            zoom={this.props.zoom}
            onMoveend={b(this.handleMapMoveEnd)}
            onZoom={b(this.handleMapZoom)}
            onClick={b(this.handleMapClick)}
          >
            <Layers
              mapType={this.props.mapType} onMapChange={b(this.handleMapTypeChange)}
              overlays={this.props.overlays} onOverlaysChange={b(this.handleOverlayChange)}
            />

            <SearchResults/>

            <ObjectsResult/>

            {tool === 'route-planner' && 
              <RoutePlannerResults 
                ref={e => this.routePlanner = e} 
                onShowToast={b(this.showToast)} />}

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
