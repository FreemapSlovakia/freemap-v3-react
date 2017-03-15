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

import { setTool, resetMap, setMapBounds, refocusMap } from 'fm3/actions/mapActions';

import 'fm3/styles/main.scss';

const ToastMessageFactory = React.createFactory(ToastMessage.animation);

class Main extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      activePopup: null
    };
  }

  componentWillMount() {
    // set redux according to URL
    this.props.onMapRefocus(getMapDiff(this.props));
  }

  componentDidMount() {
    // to initially set map bounds; TODO map.onLoad would be better but is not called :-(
    setTimeout(() => {
      this.changeMapBounds();
    });
  }

  componentWillReceiveProps(newProps) {
    const stateChanged = [ 'mapType', 'overlays', 'zoom', 'lat', 'lon' ].some(prop => newProps[prop] !== this.props[prop]);
    if (stateChanged) {
      // update URL
      const { mapType, overlays, zoom, lat, lon } = newProps;
      const newUrl = `/${mapType}${overlays.join('')}/${zoom}/${lat.toFixed(6)}/${lon.toFixed(6)}`;
      newProps.history.replace(newUrl);
    } else {
      // set redux according to URL
      const changes = getMapDiff(newProps);
      if (Object.keys(changes).length) {
        newProps.onMapRefocus(changes);
      }
    }
  }

  handleMapMoveEnd() {
    this.changeMapBounds();

    const map = this.refs.map.leafletElement;
    const { lat, lng: lon } = map.getCenter();
    const zoom = map.getZoom();

    if (this.props.lat !== lat || this.props.lon !== lon || this.props.zoom !== zoom) {
      this.props.onMapRefocus({ lat, lon, zoom });
    }
  }

  // TODO there may be more map events which changes map bounds. eg "resize". Implement.
  changeMapBounds() {
    const b = this.refs.map.leafletElement.getBounds();

    const newBounds = {
      south: b.getSouth(),
      west: b.getWest(),
      north: b.getNorth(),
      east: b.getEast()
    };

    const changed = [ 'south', 'west', 'north', 'east' ].some(prop => this.props.bounds[prop] !== newBounds[prop]);

    if (changed) {
      this.props.onMapBoundsChange(newBounds);
    }
  }

  handleMapTypeChange(mapType) {
    if (this.props.mapType !== mapType) {
      this.props.onMapRefocus({ mapType });
    }
  }

  handleOverlayChange(overlays) {
    this.props.onMapRefocus({ overlays });
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
      this.showToast('info', null, 'Vyhľadávanie POIs funguje až od zoom úrovne 12');
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

  onPopupClose() {
    this.setState({ activePopup: null });
  }

  render() {
    const { tool, onResetMap } = this.props;
    const { activePopup } = this.state;
    const b = (fn, ...args) => fn.bind(this, ...args);
    const showDefaultMenu = [ null, 'settings', 'measure', 'measure-ele' ].indexOf(tool) !== -1;

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
              {(showDefaultMenu || tool === 'search') && <Search/>}
              {tool === 'route-planner' && <RoutePlanner/>}
              {activePopup === 'settings' && <Settings onPopupClose={b(this.onPopupClose)} onShowToast={b(this.showToast)}/>}
              {showDefaultMenu &&
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
              }
              {showDefaultMenu &&
                <Nav pullRight>
                  <NavDropdown title="Viac" id="additional-menu-items">
                    <MenuItem onClick={() => this.setState({ activePopup: 'settings' })}><FontAwesomeIcon icon="cog" /> Nastavenia</MenuItem>
                    <MenuItem onClick={() => window.open('http://wiki.freemap.sk/NahlasenieChyby')}><FontAwesomeIcon icon="exclamation-triangle" /> Nahlás chybu</MenuItem>
                  </NavDropdown>
                </Nav>
              }
            </Navbar.Collapse>
          </Navbar>
        </Row>
        <Row className={`tool-${tool || 'none'} active-map-type-${this.props.mapType}`}>
          <Map
            ref="map"
            center={L.latLng(this.props.lat, this.props.lon)}
            zoom={this.props.zoom}
            onMoveend={b(this.handleMapMoveEnd)}
            onClick={b(this.handleMapClick)}
            onResize={b(this.changeMapBounds)}
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
  lat: React.PropTypes.number,
  lon: React.PropTypes.number,
  zoom: React.PropTypes.number,
  bounds: React.PropTypes.object,
  match: React.PropTypes.object,
  history: React.PropTypes.object,
  tool: React.PropTypes.string,
  mapType: React.PropTypes.string,
  overlays: React.PropTypes.array,
  onSetTool: React.PropTypes.func.isRequired,
  onResetMap: React.PropTypes.func.isRequired,
  objectsModalShown: React.PropTypes.bool,
  onMapBoundsChange: React.PropTypes.func.isRequired,
  onMapRefocus: React.PropTypes.func.isRequired
};

export default connect(
  function (state) {
    return {
      lat: state.map.lat,
      lon: state.map.lon,
      zoom: state.map.zoom,
      tool: state.map.tool,
      objectsModalShown: state.objects.objectsModalShown,
      mapType: state.map.mapType,
      overlays: state.map.overlays,
      bounds: state.map.bounds
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
      onMapRefocus(changes) {
        dispatch(refocusMap(changes));
      }
    };
  }
)(Main);

function getMapDiff(props) {
  const { match: { params } } = props;
  const layersOK = /^[ATCK]I?$/.test(params.mapType);
  const layers = layersOK ? params.mapType : 'T';
  const mapType = layers.charAt(0);
  const overlays = layers.length > 1 ? layers.substring(1).split('') : [];

  const changes = {};

  if (!layersOK || mapType !== props.mapType) {
    changes.mapType = mapType;
  }

  if (!layersOK || overlays.join('') !== props.overlays.join('')) {
    changes.overlays = overlays;
  }

  const lat = parseFloat(params.lat);
  const lon = parseFloat(params.lon);

  if (isNaN(lat) || isNaN(lon) || Math.abs(lat - props.lat) > 0.000001 || Math.abs(lon - props.lon) > 0.000001) {
    changes.lat = lat || 48.70714;
    changes.lon = lon || 19.4995;
  }

  const zoom = parseInt(params.zoom);

  if (isNaN(zoom) || zoom !== props.zoom) {
    changes.zoom = zoom || 0;
  }

  return changes;
}
