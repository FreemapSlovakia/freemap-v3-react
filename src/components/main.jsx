import React from 'react';
import update from 'immutability-helper';
import { hashHistory as history } from 'react-router';
import { Map, Marker, Popup } from 'react-leaflet';

import Navbar from 'react-bootstrap/lib/Navbar';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import Button from 'react-bootstrap/lib/Button';
import Row from 'react-bootstrap/lib/Row';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
// import MenuItem from 'react-bootstrap/lib/MenuItem';
// import NavDropdown from 'react-bootstrap/lib/NavDropdown';

import { toHtml } from '../poiTypes';

import ObjectsModal from './objectsModal.jsx';
import Layers from './layers.jsx';
import Measurement from './measurement.jsx';
import RoutePlanner from './routePlanner.jsx';
import RoutePlannerResults from './routePlannerResults.jsx';

export default class Main extends React.Component {

  constructor(props) {
    super(props);

    this.state = Object.assign({
      searchQuery: '',
      searchResults: [],
      lengthMeasurePoints: [],
      tool: null,
      routePlannerPoints: {start: {}, finish: {}},
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
      this.setState({ mapType }, () => {
        this.updateUrl();
      });
    }
  }

  updateUrl() {
    const { zoom, lat, lon, mapType } = this.state;
    history.replace(`/${mapType}/${zoom}/${lat.toFixed(6)}/${lon.toFixed(6)}`);
  }

  updateSearchQuery(e) {
    this.setState({ searchQuery: e.target.value });
  }

  doSearch(e) {
    e.preventDefault();

    const { lat, lon, searchQuery, zoom } = this.state;
    // fetch(`http://www.freemap.sk/api/0.1/q/${encodeURIComponent(q)}&lat=${lat}&lon=${lon}`, {
    fetch(`http://nominatim.openstreetmap.org/search/${encodeURIComponent(searchQuery)}`
        + `?format=jsonv2&lat=${lat}&lon=${lon}&zoom=${zoom}&namedetails=1&extratags=1`, {
      method: 'GET'
    }).then(res => res.json()).then(data => {
      // TODO map type to tag
      const searchResults = data.map((d, id) => ({ id, lat: d.lat, lon: d.lon, tags: { name: d.namedetails.name} }));
      if (searchResults.length) {
        const { lat, lon } = searchResults[0];
        this.setState({ searchResults, lat, lon, zoom: 14, lengthMeasurePoints: [], tool: null });
      } else {
        this.setState({ searchResults, lengthMeasurePoints: [], tool: null });
      }
    });
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
    if (this.state.tool === 'measure') {
      const newLMPoints = update(this.state.lengthMeasurePoints, {$push: [ { lat, lon } ] });
      this.setState({ lengthMeasurePoints: newLMPoints });
    }

    if (this.state.tool === 'route-planner') {
      const pointType = this.state.routePlannerPickMode;
      let newRoutePlannerPoints = null;

      if (pointType === 'start' || pointType === 'finish') {
        newRoutePlannerPoints = update(this.state.routePlannerPoints, {
          [pointType]: { lat: {$set: lat }, lon: {$set: lon }}
        });

        this.setState({ routePlannerPickMode: null, routePlannerPoints: newRoutePlannerPoints});
      }
    }
  }

  handleMeasureMarkerDrag(i, { latlng: { lat, lng: lon } }) {
    const newLMPoints = update(this.state.lengthMeasurePoints, {[i]: { $merge: { lat, lon } } });
    this.setState({ lengthMeasurePoints: newLMPoints });
  }

  setTool(t) {
    const tool = t === this.state.tool ? null : t;
    const mainNavigationIsHidden = tool === 'route-planner';
    this.setState({ tool, mainNavigationIsHidden, searchResults: [], lengthMeasurePoints: [], routePlannerPoints: {start: {}, finish: {}}, routePlannerPickMode: null});
  }

  setRoutePlannerPointPickMode(routePlannerPickMode) {
    this.setState({routePlannerPickMode});
  }

  render() {
    const { lat, lon, zoom, mapType, searchQuery, searchResults, objectsModalShown, lengthMeasurePoints, tool,
      mainNavigationIsHidden, routePlannerPoints, routePlannerPickMode } = this.state;

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
              <Navbar.Form pullLeft className={mainNavigationIsHidden ? 'hidden' : ''}>
                <form onSubmit={b(this.doSearch)}>
                  <FormGroup>
                    <FormControl type="text" value={searchQuery} placeholder="Brusno" onChange={b(this.updateSearchQuery)}/>
                  </FormGroup>
                  {' '}
                  <Button type="submit" disabled={!searchQuery.length}>
                    <Glyphicon glyph="search"/>
                  </Button>
                </form>
              </Navbar.Form>
              <Nav className={mainNavigationIsHidden ? 'hidden' : ''}>
                <NavItem onClick={b(this.showObjectsModal, true)} disabled={zoom < 12}>Objekty</NavItem>
                <NavItem onClick={b(this.setTool, 'measure')} active={tool === 'measure'}>Meranie</NavItem>
                <NavItem onClick={b(this.setTool, 'route-planner')} active={tool === 'route-planner'}>Plánovač trasy</NavItem>
              </Nav>
              { tool === 'route-planner' ? <RoutePlanner routePlannerPoints={routePlannerPoints} pickPointMode={routePlannerPickMode} onChangePickPointMode={b(this.setRoutePlannerPointPickMode)} onCancel={b(this.setTool, null)} /> : null }
            </Navbar.Collapse>
          </Navbar>
        </Row>
        <Row>
          <Map ref="map" style={{ height: 'calc(100vh - 52px)' }} center={L.latLng(lat, lon)} zoom={zoom}
              onMoveend={b(this.handleMapMoveend)}
              onZoom={b(this.handleMapZoom)}
              onClick={b(this.handleMapClick)}>

            <Layers onMapChange={b(this.handleMapChange)} mapType={mapType}/>

            {searchResults.map(({ id, lat, lon, tags }) => {
              const __html = toHtml(tags);

              return (
                <Marker key={id} position={L.latLng(lat, lon)}>
                  {__html && <Popup autoPan={false}><span dangerouslySetInnerHTML={{ __html }}/></Popup>}
                </Marker>
              );
            })}

            <Measurement lengthMeasurePoints={lengthMeasurePoints} onMeasureMarkerDrag={b(this.handleMeasureMarkerDrag)}/>
            <RoutePlannerResults routePlannerPoints={routePlannerPoints}/>
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
    mapType: mapType || 'T',
    lat: parseFloat(lat) || 48.70714,
    lon: parseFloat(lon) || 19.4995,
    zoom: parseInt(zoom) || 8
  };
}
