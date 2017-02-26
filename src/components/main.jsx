import React from 'react';
import { hashHistory as history } from 'react-router'

import { Map, TileLayer, Marker, LayersControl, Popup, Tooltip, Polyline } from 'react-leaflet';

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

import mapDefinitions from '../mapDefinitions';
import { distance } from '../geoutils';
import { toHtml } from '../poiTypes';

import ObjectsModal from './objectsModal.jsx';

export default class Main extends React.Component {

  constructor(props) {
    super(props);

    const { zoom, lat, lon, mapType } = props.params;

    this.state = {
      mapType: mapType || 'T',
      lat: parseFloat(lat) || 48.70714,
      lon: parseFloat(lon) || 19.4995,
      zoom: parseInt(zoom) || 8,
      searchQuery: '',
      searchResults: [],
      lengthMeasurePoints: [],
      tool: null
    };
  }

  componentWillReceiveProps(newProps) {
    const { zoom, lat, lon, mapType } = newProps.params;

    this.setState({
      mapType: mapType || 'T',
      lat: parseFloat(lat) || 48.70714,
      lon: parseFloat(lon) || 19.4995,
      zoom: parseInt(zoom) || 8
    });
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
      this.setState({ lengthMeasurePoints: [ ...this.state.lengthMeasurePoints, { lat, lon } ] });
    }
  }

  handleMeasureMarkerDrag(i, { latlng: { lat, lng: lon } }) {
    const lengthMeasurePoints = [ ...this.state.lengthMeasurePoints ];
    lengthMeasurePoints[i] = { lat, lon };
    this.setState({ lengthMeasurePoints });
  }

  setTool(t) {
    const tool = t === this.state.tool ? null : t;
    this.setState({ tool, searchResults: [], lengthMeasurePoints: [] });
  }

  render() {
    const { lat, lon, zoom, mapType, searchQuery, searchResults, objectsModalShown, lengthMeasurePoints, tool } = this.state;

    const b = (fn, ...args) => fn.bind(this, ...args);

    let prev = null;
    let dist = 0;

    const km = Intl.NumberFormat('sk', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

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
              <Navbar.Form pullLeft>
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
              <Nav>
                <NavItem onClick={b(this.showObjectsModal, true)} disabled={zoom < 12}>Objekty</NavItem>
                <NavItem onClick={b(this.setTool, 'measure')} active={tool === 'measure'}>Meranie</NavItem>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        </Row>
        <Row>
          <Map ref="map" style={{ height: 'calc(100vh - 52px)' }} center={L.latLng(lat, lon)} zoom={zoom}
            onMoveend={b(this.handleMapMoveend)}
            onZoom={b(this.handleMapZoom)}
            onClick={b(this.handleMapClick)}>

            <LayersControl position="topright">
              {
                mapDefinitions.map(({ name, type, url, attribution, maxZoom, minZoom }) => (
                  <LayersControl.BaseLayer key={type} name={name} checked={mapType === type}>
                    <TileLayer attribution={attribution} url={url}
                      onAdd={b(this.handleMapChange, type)}
                      maxZoom={maxZoom} minZoom={minZoom}/>
                  </LayersControl.BaseLayer>
                ))
              }
            </LayersControl>

            {searchResults.map(({ id, lat, lon, tags }) => {
              const __html = toHtml(tags);

              return (
                <Marker key={id} position={L.latLng(lat, lon)}>
                  {__html && <Popup autoPan={false}><span dangerouslySetInnerHTML={{ __html }}/></Popup>}
                </Marker>
              );
            })}

            {lengthMeasurePoints.map((p, i) => {
              if (prev) {
                dist += distance(p.lat, p.lon, prev.lat, prev.lon);
              }
              prev = p;

              const m = (
                <Marker key={i} position={L.latLng(lat, lon)} draggable onDrag={b(this.handleMeasureMarkerDrag, i)}>
                  <Tooltip permanent><span>{km.format(dist / 1000)} km</span></Tooltip>
                </Marker>
              );

              return m;
            })}

            {lengthMeasurePoints.length > 1 && <Polyline positions={lengthMeasurePoints.map(({ lat, lon }) => [lat, lon])}/>}

          </Map>
        </Row>
      </div>
    );
  }
}

Main.propTypes = {
  params: React.PropTypes.object
}
