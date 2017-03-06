import React from 'react';
import { Map, Marker, Popup } from 'react-leaflet';
import { connect } from 'react-redux';

import Navbar from 'react-bootstrap/lib/Navbar';
import Row from 'react-bootstrap/lib/Row';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';

import { toHtml } from 'fm3/poiTypes';
import Search from 'fm3/components/Search';
import SearchResults from 'fm3/components/SearchResults';
import ObjectsModal from 'fm3/components/ObjectsModal';
import Layers from 'fm3/components/Layers';
import Measurement from 'fm3/components/Measurement';
import ElevationMeasurement from 'fm3/components/ElevationMeasurement';
import RoutePlanner from 'fm3/components/RoutePlanner';
import RoutePlannerResults from 'fm3/components/RoutePlannerResults';
import { setTool, setMapCenter, setMapZoom, setMapType, setMapOverlays } from 'fm3/actions/mapActions';

class Main extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      poiSearchResults: [],
      selectedSearchResult: null,
      highlightedSearchSuggestion: null
    };
  }

  // TODO parse URL and dispatch changes, otherwise programmatich URL change will not update the map state
  // componentWillReceiveProps(newProps) {
  //   this.setState(toMapState(newProps.params));
  // }

  handleMapMoveend(e) {
    const { lat, lng: lon } = e.target.getCenter();
    this.props.onMapCenterChange({ lat, lon });
  }

  handleMapZoom(e) {
    this.props.onMapZoomChange(e.target.getZoom());
  }

  handleMapTypeChange(mapType) {
    this.props.onMapTypeChange(mapType);
  }

  handleOverlayChange(overlays) {
    this.props.onMapOverlaysChange(overlays);
  }

  showObjectsModal(objectsModalShown) {
    this.setState({ objectsModalShown });
  }

  showObjects(filter) {
    this.setState({ objectsModalShown: false });

    if (!filter || !filter.length) {
      return;
    }

    const b = this.map.leafletElement.getBounds();

    const bbox = `(${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()})`;
    const query = `[out:json][timeout:60]; (${filter.map(f => `${f}${bbox};`).join('')}); out qt;`;

    return fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`
    }).then(res => res.json()).then(data => {
      this.setState({
        poiSearchResults: data.elements.map((d, id) => ({ id, lat: d.lat, lon: d.lon, tags: d.tags })),
        selectedSearchResult: null
      });
    });
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
    this.setState({ selectedSearchResult, highlightedSearchSuggestion: null, poiSearchResults: [] });
  }

  refocusMap(lat, lon, zoom) {
    this.setState({ lat, lon, zoom });
  }

  render() {
    const { tool, onSetTool, center: { lat, lon }, zoom, mapType, overlays } = this.props;

    const { objectsModalShown, poiSearchResults, selectedSearchResult, highlightedSearchSuggestion } = this.state;

    const b = (fn, ...args) => fn.bind(this, ...args);

    return (
      <div className="container-fluid">
        {objectsModalShown && <ObjectsModal onClose={b(this.showObjects)}/>}

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
                    <NavItem onClick={b(this.showObjectsModal, true)} disabled={zoom < 12}>Objekty</NavItem>
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
              doMapRefocus={b(this.refocusMap)}/>

            {poiSearchResults.map(({ id, lat, lon, tags }) => {
              const __html = toHtml(tags);

              return (
                <Marker key={id} position={L.latLng(lat, lon)}>
                  {__html && <Popup autoPan={false}><span dangerouslySetInnerHTML={{ __html }}/></Popup>}
                </Marker>
              );
            })}

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
  overlays: React.PropTypes.array.isRequired // TODO enums
};

export default connect(function (state) {
  return {
    tool: state.map.tool,
    center: state.map.center,
    zoom: state.map.zoom,
    mapType: state.map.mapType,
    overlays: state.map.overlays
  };
},
function (dispatch) {
  return {
    onSetTool: function(tool) {
      dispatch(setTool(tool));
    },
    onMapCenterChange: function({ lat, lon }) {
      dispatch(setMapCenter({ lat, lon }));
    },
    onMapZoomChange: function(zoom) {
      dispatch(setMapZoom(zoom));
    },
    onMapTypeChange: function(mapType) {
      dispatch(setMapType(mapType));
    },
    onMapOverlaysChange: function(overlays) {
      dispatch(setMapOverlays(overlays));
    }
  };
})(Main);

function toMapState({ zoom, lat, lon, mapType }) {
  return {
    mapType: mapType && mapType.charAt(0) || 'T',
    lat: parseFloat(lat) || 48.70714,
    lon: parseFloat(lon) || 19.4995,
    zoom: parseInt(zoom) || 8,
    overlays: mapType && mapType.substring(1).split('') || []
  };
}
