import React from 'react';
import { hashHistory as history } from 'react-router';
import { Map, Marker, Popup } from 'react-leaflet';

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
import EleMeasurement from 'fm3/components/EleMeasurement';
import RoutePlanner from 'fm3/components/RoutePlanner';
import RoutePlannerResults from 'fm3/components/RoutePlannerResults';

export default class Main extends React.Component {

  constructor(props) {
    super(props);

    this.state = Object.assign({
      poiSearchResults: [],
      selectedSearchResult: null,
      highlightedSearchSuggestion: null,
      tool: null,
      mainNavigationIsHidden: false,
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
        selectedSearchResult: null,
        tool: null
      });
    });
  }

  handleMapClick({ latlng: { lat, lng: lon }}) {
    if (this.measurement) {
      this.measurement.handlePointAdded({ lat, lon });
    }

    if (this.eleMeasurement) {
      this.eleMeasurement.handlePointAdded({ lat, lon });
    }

    if (this.routePlanner) {
      this.routePlanner.getWrappedInstance().handlePointAdded({ lat, lon });
    }
  }

  setTool(t) {
    const tool = t === this.state.tool ? null : t;
    const mainNavigationIsHidden = tool === 'route-planner';

    this.setState({
      tool,
      mainNavigationIsHidden,
      selectedSearchResult: null,
      poiSearchResults: [],
    });
  }

  onSearchSuggestionHighlightChange(highlightedSearchSuggestion) {
    this.setState({ highlightedSearchSuggestion });
  }

  onSelectSearchResult(selectedSearchResult) {
    this.setState({ selectedSearchResult, highlightedSearchSuggestion: null, tool: null, poiSearchResults: [] });
  }

  refocusMap(lat, lon, zoom) {
    this.setState({ lat, lon, zoom });
  }

  render() {
    const { lat, lon, zoom, mapType, overlays, objectsModalShown, tool, mainNavigationIsHidden,
      poiSearchResults, selectedSearchResult, highlightedSearchSuggestion } = this.state;

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
                tool === 'route-planner' && <RoutePlanner onCancel={b(this.setTool, null)}/>
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

            {tool === 'route-planner' && <RoutePlannerResults ref={e => this.routePlanner = e}/>}

            {tool === 'measure' && <Measurement ref={e => this.measurement = e}/>}

            {tool === 'measure-ele' && <EleMeasurement ref={e => this.eleMeasurement = e}/>}
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
