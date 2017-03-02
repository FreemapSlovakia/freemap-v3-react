import React from 'react';
import update from 'immutability-helper';
import { hashHistory as history } from 'react-router';
import { Map} from 'react-leaflet';

import Navbar from 'react-bootstrap/lib/Navbar';

import Row from 'react-bootstrap/lib/Row';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';

// import MenuItem from 'react-bootstrap/lib/MenuItem';
// import NavDropdown from 'react-bootstrap/lib/NavDropdown';


import Search from './search';
import SearchResults from './searchResults';
import ObjectsModal from './objectsModal';
import Layers from './layers';
import Measurement from './measurement';
import RoutePlanner from './routePlanner';
import RoutePlannerResults from './routePlannerResults';

export default class Main extends React.Component {

  constructor(props) {
    super(props);

    this.state = Object.assign({
      searchResults: [],
      lengthMeasurePoints: [],
      highlightedSearchSuggestion: null,
      tool: null,
      routePlannerPoints: {start: {}, midpoints: [], finish: {}},
      routePlannerTransportType: 'car',
      routePlannerPickMode: null,
      mainNavigationIsHidden: false
    }, toMapState(props.params));
  }

  componentWillReceiveProps(newProps) {
    this.setState(toMapState(newProps.params));
  }

  handleMapMoveend(e) {
    const center = e.target.getCenter();
    this.setState({ lat: center.lat, lon: center.lng }, () => {
      const { zoom, lat, lon } = this.state;
      const p = this.props.params;

      if (Math.abs(p.lat - lat) > 0.000001 || Math.abs(p.lon - lon) > 0.000001 || p.zoom != zoom) {
        this.updateUrl();
      }
    });
  }

  handleMapZoom(e) {
    this.setState({ zoom: e.target.getZoom() });
  }

  handleMapChange(mapType) {
    if (this.state.mapType !== mapType) {
      this.setState({ mapType }, this.updateUrl.bind(this));
    }
  }

  handleOverlayChange(overlays) {
    this.setState({ overlays }, this.updateUrl.bind(this));
  }

  updateUrl() {
    const { zoom, lat, lon, mapType, overlays } = this.state;
    history.replace(`/${mapType}${overlays.join('')}/${zoom}/${lat.toFixed(6)}/${lon.toFixed(6)}`);
  }

  showObjectsModal(objectsModalShown) {
    this.setState({ objectsModalShown });
  }

  showObjects(filter) {
    this.setState({ objectsModalShown: false });

    if (!filter.length) {
      return;
    }

    const b = this.refs.map.leafletElement.getBounds();

    const bbox = `(${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()})`;
    const query = `[out:json][timeout:60]; (${filter.map(f => `${f}${bbox};`).join('')}); out qt;`;

    return fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`
    }).then(res => res.json()).then(data => {
      this.setState({
        searchResults: data.elements.map((d, id) => ({ id, lat: d.lat, lon: d.lon, tags: d.tags })),
        lengthMeasurePoints: [],
        tool: null
      });
    });
  }

  handleMapClick({ latlng: { lat, lng: lon }}) {
    const { tool } = this.state;

    if (tool === 'measure') {
      this.setState({ lengthMeasurePoints: update(this.state.lengthMeasurePoints, {$push: [ { lat, lon } ] }) });
    } else if (tool === 'route-planner') {
      const { routePlannerPickMode, routePlannerPoints } = this.state;

      if (routePlannerPickMode) {
        let newRoutePlannerPoints;

        if (routePlannerPickMode === 'start' || routePlannerPickMode === 'finish') {
          newRoutePlannerPoints = update(routePlannerPoints, {
            [ routePlannerPickMode ]: { lat: {$set: lat }, lon: {$set: lon }}
          });
        } else if (routePlannerPickMode == 'midpoint') {
          newRoutePlannerPoints = update(routePlannerPoints, { midpoints : { $push: [ { lat, lon } ] }});
        } else {
          newRoutePlannerPoints = null;
        }

        this.setState({ routePlannerPickMode: null, routePlannerPoints: newRoutePlannerPoints});
      }
    }
  }

  handleMeasureMarkerDrag(i, { latlng: { lat, lng: lon } }) {
    this.setState({ lengthMeasurePoints: update(this.state.lengthMeasurePoints, { [ i ]: { $merge: { lat, lon } } }) });
  }

  setTool(t) {
    const tool = t === this.state.tool ? null : t;
    const mainNavigationIsHidden = tool === 'route-planner';
    this.setState({ tool, mainNavigationIsHidden, searchResults: [], lengthMeasurePoints: [], routePlannerPoints: {
      start: {}, midpoints: [], finish: {}}, routePlannerPickMode: null
    });
  }
  
  onSearchSuggestionHighlightChange(s) {
    this.setState({highlightedSearchSuggestion : s});
  }

  onSearchResultsUpdate(searchResults) {
    if (searchResults.length) {
      const { lat, lon } = searchResults[0];
      this.setState({ searchResults, lat, lon, zoom: 14, highlightedSearchSuggestion: null, lengthMeasurePoints: [], tool: null });
    } else {
      this.setState({ searchResults, highlightedSearchSuggestion: null, lengthMeasurePoints: [], tool: null });
    }
  }

  setRoutePlannerPointPickMode(routePlannerPickMode) {
    this.setState({ routePlannerPickMode });
  }

  changeRoutePlannerTransportType(routePlannerTransportType) {
    this.setState({ routePlannerTransportType });
  }

  onRouteMarkerDragend(movedPointType, position, event) {
    const { lat, lng: lon } = event.target._latlng;
    let newRoutePlannerPoints;
    if (movedPointType == 'start' || movedPointType == 'finish') {
      newRoutePlannerPoints = update(this.state.routePlannerPoints, {
        [ movedPointType ]: { lat: { $set: lat }, lon: { $set: lon } }
      });
    } else {
      newRoutePlannerPoints = update(this.state.routePlannerPoints, { midpoints : {[position]: { $merge: { lat, lon } } } });
    }

    this.setState({ routePlannerPickMode: null, routePlannerPoints: newRoutePlannerPoints });
  }

  render() {
    const { lat, lon, zoom, mapType, overlays, objectsModalShown, lengthMeasurePoints, tool,
      mainNavigationIsHidden, routePlannerPoints, routePlannerTransportType, routePlannerPickMode,
      searchResults, highlightedSearchSuggestion} = this.state;

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
              <div className={mainNavigationIsHidden ? 'hidden' : ''}>
                <Search
                  onSearchSuggestionHighlightChange={b(this.onSearchSuggestionHighlightChange)}
                  onSearchResultsUpdate={b(this.onSearchResultsUpdate)}
                  lat={String(lat)}
                  lon={String(lon)}
                  zoom={zoom} />
              </div>
              <Nav className={mainNavigationIsHidden ? 'hidden' : ''}>
                <NavItem onClick={b(this.showObjectsModal, true)} disabled={zoom < 12}>Objekty</NavItem>
                <NavItem onClick={b(this.setTool, 'measure')} active={tool === 'measure'}>Meranie</NavItem>
                <NavItem onClick={b(this.setTool, 'route-planner')} active={tool === 'route-planner'}>Plánovač trasy</NavItem>
              </Nav>
              {
                tool === 'route-planner' && <RoutePlanner
                  transportType={routePlannerTransportType}
                  onChangeTransportType={b(this.changeRoutePlannerTransportType)}
                  routePlannerPoints={routePlannerPoints}
                  pickPointMode={routePlannerPickMode}
                  onChangePickPointMode={b(this.setRoutePlannerPointPickMode)}
                  onCancel={b(this.setTool, null)} />
              }
            </Navbar.Collapse>
          </Navbar>
        </Row>
        <Row>
          <Map ref="map" style={{ height: 'calc(100vh - 52px)' }} center={L.latLng(lat, lon)} zoom={zoom}
              onMoveend={b(this.handleMapMoveend)}
              onZoom={b(this.handleMapZoom)}
              onClick={b(this.handleMapClick)}>

            <Layers
              mapType={mapType} onMapChange={b(this.handleMapChange)}
              overlays={overlays} onOverlaysChange={b(this.handleOverlayChange)}/>

            <SearchResults 
              highlightedSearchSuggestion={highlightedSearchSuggestion} 
              searchResults={searchResults}/>

            <Measurement lengthMeasurePoints={lengthMeasurePoints} onMeasureMarkerDrag={b(this.handleMeasureMarkerDrag)}/>

            <RoutePlannerResults
              routePlannerPoints={routePlannerPoints}
              onRouteMarkerDragend={b(this.onRouteMarkerDragend)}
              transportType={routePlannerTransportType} />
          </Map>
        </Row>
      </div>
    );
  }
}

Main.propTypes = {
  params: React.PropTypes.object
};

function toMapState({ zoom, lat, lon, mapType }) {
  return {
    mapType: mapType && mapType.charAt(0) || 'T',
    lat: parseFloat(lat) || 48.70714,
    lon: parseFloat(lon) || 19.4995,
    zoom: parseInt(zoom) || 8,
    overlays: mapType && mapType.substring(1).split('') || []
  };
}
