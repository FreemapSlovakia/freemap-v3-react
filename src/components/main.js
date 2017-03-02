import React from 'react';
import update from 'immutability-helper';
import { hashHistory as history } from 'react-router';
import { Map, Marker, Popup, Tooltip } from 'react-leaflet';

import Navbar from 'react-bootstrap/lib/Navbar';

import Row from 'react-bootstrap/lib/Row';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';

// import MenuItem from 'react-bootstrap/lib/MenuItem';
// import NavDropdown from 'react-bootstrap/lib/NavDropdown';

import { toHtml } from '../poiTypes';
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
      poiSearchResults: [],
      lengthMeasurePoints: [],
      selectedSearchResult: null,
      highlightedSearchSuggestion: null,
      tool: null,
      routePlannerPoints: { start: null, midpoints: [], finish: null },
      routePlannerTransportType: 'car',
      routePlannerPickMode: null,
      mainNavigationIsHidden: false,
      elePoi: null,
      ele: null,
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
        poiSearchResults: data.elements.map((d, id) => ({ id, lat: d.lat, lon: d.lon, tags: d.tags })),
        lengthMeasurePoints: [],
        selectedSearchResult: null,
        tool: null
      });
    });
  }

  handleMapClick({ latlng: { lat, lng: lon }}) {
    const { tool } = this.state;

    if (tool === 'measure') {
      this.setState(update(this.state, { lengthMeasurePoints: { $push: [ { lat, lon } ] } }));
    } else if (tool === 'measure-ele') {
      this.setState({ ele: null, elePoi: { lat, lon } });
      this.findEle();
    } else if (tool === 'route-planner') {
      const { routePlannerPickMode: mode, routePlannerPoints: { start, finish } } = this.state;

      if (mode === 'start' || mode === 'finish') {
        const u = update(this.state, {
          routePlannerPickMode: { $set: (start || mode === 'start') ? ((finish || mode === 'finish') ? 'midpoint' : 'finish') : 'start' },
          routePlannerPoints: { [ mode ]: { $set: { lat, lon } } }
        });

        this.setState(u);
      } else if (mode == 'midpoint') {
        this.setState(update(this.state, { routePlannerPoints: { midpoints : { $push: [ { lat, lon } ] } } }));
      }
    }
  }

  findEle() {
    const { lat, lon } = this.state.elePoi;
    fetch(`https://www.freemap.sk/api/0.1/elevation/${lat}%7C${lon}`, {
      method: 'GET'
    }).then(res => res.json()).then(data => {
      this.setState({ ele: parseFloat(data.ele), elePoi: { lat: parseFloat(data.lat), lon: parseFloat(data.lon) } });
    });
  }

  handleMeasureMarkerDrag(i, { latlng: { lat, lng: lon } }) {
    this.setState(update(this.state, { lengthMeasurePoints: { [ i ]: { $set: { lat, lon } } } }));
  }

  handleEleMeasureMarkerDrag({ latlng: { lat, lng: lon } }) {
    this.setState({ elePoi: { lat, lon }, ele: null });
  }

  handleEleMeasureMarkerDragEnd() {
    this.findEle();
  }

  setTool(t) {
    const tool = t === this.state.tool ? null : t;
    const mainNavigationIsHidden = tool === 'route-planner';

    this.setState({
      tool,
      mainNavigationIsHidden,
      selectedSearchResult: null,
      poiSearchResults: [],
      lengthMeasurePoints: [],
      routePlannerPoints: { start: {}, midpoints: [], finish: {} },
      routePlannerPickMode: null
    });
  }

  onSearchSuggestionHighlightChange(highlightedSearchSuggestion) {
    this.setState({ highlightedSearchSuggestion });
  }

  onSelectSearchResult(selectedSearchResult) {
    this.setState({ selectedSearchResult, highlightedSearchSuggestion: null, lengthMeasurePoints: [], tool: null, poiSearchResults: [] });
  }

  refocusMap(lat, lon, zoom) {
    this.setState({ lat, lon, zoom });
  }

  setRoutePlannerPointPickMode(routePlannerPickMode) {
    this.setState({ routePlannerPickMode });
  }

  changeRoutePlannerTransportType(routePlannerTransportType) {
    this.setState({ routePlannerTransportType });
  }

  handleRouteMarkerDragend(movedPointType, position, event) {
    const { lat, lng: lon } = event.target._latlng;
    if (movedPointType === 'start' || movedPointType === 'finish') {
      this.setState(update(this.state, {
        routePlannerPoints: { [ movedPointType ]: { $set: { lat, lon } } }
      }));
    } else {
      this.setState(update(this.state, {
        routePlannerPoints: { midpoints: { [ position ]: { $set: { lat, lon } } } }
      }));
    }
  }

  render() {
    const { lat, lon, zoom, mapType, overlays, objectsModalShown, lengthMeasurePoints, tool,
      mainNavigationIsHidden, routePlannerPoints, routePlannerTransportType, routePlannerPickMode,
      poiSearchResults, selectedSearchResult, highlightedSearchSuggestion, elePoi, ele } = this.state;

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
              {!mainNavigationIsHidden &&
                <div>
                  <Search
                    onSearchSuggestionHighlightChange={b(this.onSearchSuggestionHighlightChange)}
                    onSelectSearchResult={b(this.onSelectSearchResult)}
                    lat={lat}
                    lon={lon}
                    zoom={zoom}/>

                  <Nav className={mainNavigationIsHidden ? 'hidden' : ''}>
                    <NavItem onClick={b(this.showObjectsModal, true)} disabled={zoom < 12}>Objekty</NavItem>
                    <NavItem onClick={b(this.setTool, 'measure')} active={tool === 'measure'}>Meranie</NavItem>
                    <NavItem onClick={b(this.setTool, 'route-planner')} active={tool === 'route-planner'}>Plánovač trasy</NavItem>
                    <NavItem onClick={b(this.setTool, 'measure-ele')} active={tool === 'measure-ele'}>Výškomer</NavItem>
                  </Nav>
                </div>
              }
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
          <Map
              ref="map"
              className={`tool-${tool || 'none'}`}
              center={L.latLng(lat, lon)}
              zoom={zoom}
              onMoveend={b(this.handleMapMoveend)}
              onZoom={b(this.handleMapZoom)}
              onClick={b(this.handleMapClick)}>

            <Layers
              mapType={mapType} onMapChange={b(this.handleMapChange)}
              overlays={overlays} onOverlaysChange={b(this.handleOverlayChange)}/>

            <SearchResults
              highlightedSearchSuggestion={highlightedSearchSuggestion}
              selectedSearchResult={selectedSearchResult}
              doMapRefocus={b(this.refocusMap)}
              map={this.refs.map}/>

            {poiSearchResults.map(({ id, lat, lon, tags }) => {
              const __html = toHtml(tags);

              return (
                <Marker key={id} position={L.latLng(lat, lon)}>
                  {__html && <Popup autoPan={false}><span dangerouslySetInnerHTML={{ __html }}/></Popup>}
                </Marker>
              );
            })}

            {tool === 'route-planner' &&
              <RoutePlannerResults
                routePlannerPoints={routePlannerPoints}
                onRouteMarkerDragend={b(this.handleRouteMarkerDragend)}
                transportType={routePlannerTransportType} />
            }

            {tool === 'measure' &&
              <Measurement lengthMeasurePoints={lengthMeasurePoints} onMeasureMarkerDrag={b(this.handleMeasureMarkerDrag)}/>
            }

            {tool === 'measure-ele' && elePoi &&
              <Marker position={L.latLng(elePoi.lat, elePoi.lon)} draggable
                  onDrag={b(this.handleEleMeasureMarkerDrag)}
                  onDragend={b(this.handleEleMeasureMarkerDragEnd)}>
                {typeof ele === 'number' && <Tooltip direction="right" permanent><span>{ele} m</span></Tooltip>}
              </Marker>
            }
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
