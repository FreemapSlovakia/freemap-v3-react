import React from 'react';
import { Map } from 'react-leaflet';
import { connect } from 'react-redux';

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

import { setTool, restoreMapFromUrlParams, setMapBounds, refocusMap, setMapType, setMapOverlays } from 'fm3/actions/mapActions';
import { showObjectsModal } from 'fm3/actions/objectsActions';

class Main extends React.Component {

  componentWillMount() {
    if (this.props.params.lat) {
      this.props.onRestoreMapFromUrlParams(this.props.params);
    }
  }

  componentWillReceiveProps({ params }) {
    let mapType = null;
    if (params.mapType) {
      mapType = params.mapType.charAt(0);
    }

    if (mapType && mapType !== this.props.mapType) {
      this.props.onSetMapType(mapType);
    }

    const overlays = params.mapType.substring(1).split('');
    if (overlays && JSON.stringify(overlays) !== JSON.stringify(this.props.overlays)) {
      this.props.onSetMapOverlays(overlays);
    }

    const zoom = parseInt(params.zoom);
    const lat = parseFloat(params.lat);
    const lon = parseFloat(params.lon);
    const zoomChangedInURL = zoom && zoom !== this.props.zoom;
    const latChangedInURL = lat && lat !== this.props.center.lat;
    const lonChangedInURL = lon && lon !== this.props.center.lon;
    if (zoomChangedInURL || latChangedInURL || lonChangedInURL) {
      this.props.onMapRefocus(lat, lon, zoom);
    }
  }

  handleMapMoveend(e) {
    const center = e.target.getCenter();
    const { lat, lon } = this.props.center;
    if (Math.abs(center.lat - lat) > 0.000001 && Math.abs(center.lng - lon) > 0.000001) {
      this.handleMapBoundsChanged(e);
      this.props.onMapRefocus(center.lat, center.lng, e.target.getZoom());
    }
  }

  handleMapZoom(e) {
    const center = e.target.getCenter();
    const zoom = e.target.getZoom();
    if (zoom !== this.props.zoom) {
      this.handleMapBoundsChanged(e);
      this.props.onMapRefocus(center.lat, center.lng, e.target.getZoom());
    }
  }

  // TODO there may be more map events which changes map bounds. eg "resize". Implement.
  handleMapBoundsChanged(e) {
    const b = e.target.getBounds();
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

  render() {
    const { tool, onSetTool, onShowObjectsModal, objectsModalShown } = this.props;
    const b = (fn, ...args) => fn.bind(this, ...args);

    return (
      <div className="container-fluid">
        {objectsModalShown && <ObjectsModal/>}

        <Row>
          <Navbar fluid style={{ marginBottom: 0 }}>
            <Navbar.Header>
              <Navbar.Brand>Freemap</Navbar.Brand>
              <Navbar.Toggle/>
            </Navbar.Header>

            <Navbar.Collapse>
              {tool !== 'route-planner' &&
                <div>
                  <Search/>
                  <Nav>
                    <NavItem onClick={b(onShowObjectsModal)} disabled={this.props.zoom < 12}>Objekty</NavItem>
                    <NavItem onClick={b(onSetTool, 'measure')} active={tool === 'measure'}>Meranie vzdialenosti</NavItem>
                    <NavItem onClick={b(onSetTool, 'route-planner')} active={tool === 'route-planner'}>Plánovač trasy</NavItem>
                    <NavItem onClick={b(onSetTool, 'measure-ele')} active={tool === 'measure-ele'}>Výškomer</NavItem>
                  </Nav>
                </div>
              }
              {tool === 'route-planner' && <RoutePlanner/>}
            </Navbar.Collapse>
          </Navbar>
        </Row>
        <Row>
          <Map
              ref={map => this.map = map}
              className={`tool-${tool || 'none'}`}
              center={L.latLng(this.props.center.lat, this.props.center.lon)}
              zoom={this.props.zoom}
              onMoveend={b(this.handleMapMoveend)}
              onZoom={b(this.handleMapZoom)}
              onClick={b(this.handleMapClick)}>

            <Layers
              mapType={this.props.mapType} onMapChange={b(this.handleMapTypeChange)}
              overlays={this.props.overlays} onOverlaysChange={b(this.handleOverlayChange)}/>

            <SearchResults/>

            <ObjectsResult/>

            {tool === 'route-planner' && <RoutePlannerResults ref={e => this.routePlanner = e}/>}

            {tool === 'measure' && <Measurement ref={e => this.measurement = e}/>}

            {tool === 'measure-ele' && <ElevationMeasurement ref={e => this.elevationMeasurement = e}/>}
          </Map>
        </Row>
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
  objectsModalShown: React.PropTypes.bool,
  onShowObjectsModal: React.PropTypes.func.isRequired,
  onMapBoundsChange: React.PropTypes.func.isRequired,
  onRestoreMapFromUrlParams: React.PropTypes.func.isRequired,
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
      onShowObjectsModal() {
        dispatch(showObjectsModal());
      },
      onMapBoundsChange(bounds) {
        dispatch(setMapBounds(bounds));
      },
      onRestoreMapFromUrlParams(params) {
        dispatch(restoreMapFromUrlParams((params)));
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
