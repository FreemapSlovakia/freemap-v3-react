import React from 'react';
import { Map } from 'react-leaflet';
import { connect } from 'react-redux';
import { hashHistory as history } from 'react-router';

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

import { setTool, setMapBounds } from 'fm3/actions/mapActions';
import { showObjectsModal } from 'fm3/actions/objectsActions';

class Main extends React.Component {

  constructor(props) {
    super(props);

    this.state = Object.assign({
      selectedSearchResult: null,
      highlightedSearchSuggestion: null,
    },
    toMapState(props.params));
  }

  componentWillReceiveProps(newProps) {
    this.setState(toMapState(newProps.params));
  }

  updateUrl() {
    const { zoom, lat, lon, mapType, overlays } = this.state;
    history.replace(`/${mapType}${overlays.join('')}/${zoom}/${lat.toFixed(6)}/${lon.toFixed(6)}`);
  }

  handleMapMoveend(e) {
    const center = e.target.getCenter();
    if (Math.abs(center.lat - this.state.lat) > 0.000001 && Math.abs(center.lng - this.state.lon) > 0.000001) {
      this.setState({ lat: center.lat, lon: center.lng }, () => {
        this.updateUrl();
        this.handleMapBoundsChanged(e);
      });
    }
  }

  handleMapZoom(e) {
    const zoom = e.target.getZoom();
    if (zoom !== this.state.zoom) {
      this.setState({ zoom }, () => {
        this.handleMapBoundsChanged(e);
      });
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
    if (this.state.mapType !== mapType) {
      this.setState({ mapType }, this.updateUrl.bind(this));
    }
  }

  handleOverlayChange(overlays) {
    this.setState({ overlays }, this.updateUrl.bind(this));
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
    this.setState({ lat, lon, zoom });
  }

  render() {
    const { tool, onSetTool, onShowObjectsModal, objectsModalShown } = this.props;

    const { selectedSearchResult, highlightedSearchSuggestion, lat, lon, zoom, mapType, overlays } = this.state;

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
  objectsModalShown: React.PropTypes.bool,
  onShowObjectsModal: React.PropTypes.func.isRequired,
  onMapBoundsChange: React.PropTypes.func.isRequired
};

export default connect(
  function (state) {
    return {
      tool: state.map.tool,
      objectsModalShown: state.objects.objectsModalShown
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
      }
    };
  }
)(Main);


function toMapState({ zoom, lat, lon, mapType }) {
  return {
    mapType: mapType && mapType.charAt(0) || 'T',
    lat: parseFloat(lat) || 48.70714,
    lon: parseFloat(lon) || 19.4995,
    zoom: parseInt(zoom) || 8,
    overlays: mapType && mapType.substring(1).split('') || []
  };
}
