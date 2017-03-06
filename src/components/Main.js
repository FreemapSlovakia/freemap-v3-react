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

import { setTool, setMapCenter, setMapZoom, setMapType, setMapOverlays, setMapBounds } from 'fm3/actions/mapActions';
import { showObjectsModal } from 'fm3/actions/objectsActions';

class Main extends React.Component {

  constructor(props) {
    super(props);

    const { params: { lat, lon, zoom } } = props;
    if (Math.abs(this.props.center.lat - lat) > 0.000001 || Math.abs(this.props.center.lon - lon) > 0.000001) {
      this.props.onMapCenterChange({ lat: parseFloat(lat), lon: parseFloat(lon) });
    }
    if (this.props.zoom != zoom) {
      this.props.onMapZoomChange(parseInt(zoom));
    }

    this.state = {
      selectedSearchResult: null,
      highlightedSearchSuggestion: null
    };
  }


  componentWillReceiveProps({ params: { lat, lon, zoom } }) {
    if (Math.abs(this.props.center.lat - lat) > 0.000001 || Math.abs(this.props.center.lon - lon) > 0.000001) {
      this.props.onMapCenterChange({ lat: parseFloat(lat), lon: parseFloat(lon) });
    }
    if (this.props.zoom != zoom) {
      this.props.onMapZoomChange(parseInt(zoom));
    }
  }

  handleMapMoveend(e) {
    const { lat, lng: lon } = e.target.getCenter();
    const b = e.target.getBounds();
    this.props.onMapCenterChange({ lat, lon });
    this.props.onMapBoundsChange({
      south: b.getSouth(),
      west: b.getWest(),
      north: b.getNorth(),
      east: b.getEast()
    });
  }

  handleMapZoom(e) {
    this.props.onMapZoomChange(e.target.getZoom());
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
      this.props.onMapTypeChange(mapType);
    }
  }

  handleOverlayChange(overlays) {
    this.props.onMapOverlaysChange(overlays);
  }

  showObjectsModal(objectsModalShown) {
    this.setState({ objectsModalShown });
  }

  handleMapClick({ latlng: { lat, lng: lon }}) {
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

  onSearchSuggestionHighlightChange(highlightedSearchSuggestion) {
    this.setState({ highlightedSearchSuggestion });
  }

  onSelectSearchResult(selectedSearchResult) {
    this.setState({ selectedSearchResult, highlightedSearchSuggestion: null });
  }

  // TODO move to SearchResults
  refocusMap(lat, lon, zoom) {
    this.props.onMapCenterChange({ lat, lon });
    this.props.onMapZoomChange(zoom);
  }

  render() {
    const { tool, onSetTool, center: { lat, lon }, zoom, mapType, overlays, onShowObjectsModal, objectsModalShown } = this.props;

    const { selectedSearchResult, highlightedSearchSuggestion } = this.state;

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
                  <Search
                    onSearchSuggestionHighlightChange={b(this.onSearchSuggestionHighlightChange)}
                    onSelectSearchResult={b(this.onSelectSearchResult)}
                    lat={lat}
                    lon={lon}
                    zoom={zoom}
                  />
                  <Nav>
                    <NavItem onClick={b(onShowObjectsModal)} disabled={zoom < 12}>Objekty</NavItem>
                    <NavItem onClick={b(onSetTool, 'measure')} active={tool === 'measure'}>Meranie</NavItem>
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
              center={L.latLng(lat, lon)}
              zoom={zoom}
              onMoveend={b(this.handleMapMoveend)}
              onZoom={b(this.handleMapZoom)}
              onClick={b(this.handleMapClick)}>

            <Layers
              mapType={mapType} onMapChange={b(this.handleMapTypeChange)}
              overlays={overlays} onOverlaysChange={b(this.handleOverlayChange)}/>

            <SearchResults
              highlightedSearchSuggestion={highlightedSearchSuggestion}
              selectedSearchResult={selectedSearchResult}
              doMapRefocus={b(this.refocusMap)}
              map={this.map}/>

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
  params: React.PropTypes.object,
  tool: React.PropTypes.string,
  onSetTool: React.PropTypes.func.isRequired,
  onMapCenterChange: React.PropTypes.func.isRequired,
  onMapZoomChange: React.PropTypes.func.isRequired,
  onMapTypeChange: React.PropTypes.func.isRequired,
  onMapOverlaysChange: React.PropTypes.func.isRequired,
  center: React.PropTypes.object.isRequired,
  zoom: React.PropTypes.number.isRequired,
  mapType: React.PropTypes.string.isRequired, // TODO enum
  overlays: React.PropTypes.array.isRequired, // TODO enums
  objectsModalShown: React.PropTypes.bool,
  onShowObjectsModal: React.PropTypes.func.isRequired
};

export default connect(
  function (state) {
    return {
      tool: state.map.tool,
      center: state.map.center,
      zoom: state.map.zoom,
      mapType: state.map.mapType,
      overlays: state.map.overlays,
      objectsModalShown: state.objects.objectsModalShown
    };
  },
  function (dispatch) {
    return {
      onSetTool(tool) {
        dispatch(setTool(tool));
      },
      onMapCenterChange({ lat, lon }) {
        dispatch(setMapCenter({ lat, lon }));
      },
      onMapZoomChange(zoom) {
        dispatch(setMapZoom(zoom));
      },
      onMapTypeChange(mapType) {
        dispatch(setMapType(mapType));
      },
      onMapOverlaysChange(overlays) {
        dispatch(setMapOverlays(overlays));
      },
      onShowObjectsModal() {
        dispatch(showObjectsModal());
      },
      onMapBoundsChange(bounds) {
        dispatch(setMapBounds(bounds));
      }
    };
  }
)(Main);
