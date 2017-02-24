import React from 'react';
import { Map, TileLayer, Marker, LayersControl } from 'react-leaflet';
import Navbar from 'react-bootstrap/lib/Navbar';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import Button from 'react-bootstrap/lib/Button';
import { hashHistory } from 'react-router'
import mapDefinitions from './mapDefinitions';

export default class Main extends React.Component {

  constructor(props) {
    super(props);

    const mapType = props.params.mapType || 'T';
    const zoom = parseInt(props.params.zoom) || 8;
    const lat = parseFloat(props.params.lat) || 48.70714;
    const lon = parseFloat(props.params.lon) || 19.4995;

    this.state = {
      mapType,
      center: L.latLng(lat, lon),
      zoom,
      searchQuery: '',
      searchResults: []
    };
  }

  componentDidUpdate() {
    const {zoom, center: { lat, lng: lon }, mapType } = this.state;
    const p = this.props.params;

    if (Math.abs(p.lat - lat) > 0.000001 || Math.abs(p.lon - lon) > 0.000001 || p.zoom != zoom || p.mapType !== mapType) {
      hashHistory.push(`/${mapType}/${zoom}/${lat.toFixed(6)}/${lon.toFixed(6)}`);
    }
  }

  handleMapMoveend(e) {
    this.setState({ center: e.target.getCenter() });
  }

  handleMapZoom(e) {
    this.setState({ zoom: e.target.getZoom() });
  }

  handleMapChange(mapType) {
    this.setState({ mapType });
  }

  updateSearchQuery(e) {
    this.setState({ searchQuery: e.target.value });
  }

  doSearch() {
    const { center: { lat, lng: lon }, searchQuery: q } = this.state;
    fetch(`http://www.freemap.sk/api/0.1/q/${encodeURIComponent(q)}&lat=${lat}&lon=${lon}`, {
      method: 'GET'
    }).then(res => res.json()).then(data => {
      const searchResults = data.map((d, id) => ({id, lat: d.lat, lon: d.lon, name: d.name}));
      if (searchResults.length) {
        const { lat, lon } = searchResults[0];
        this.setState({ searchResults, center: L.latLng(lat, lon), zoom: 14  });
      } else {
        this.setState({ searchResults });
      }
    });
  }

  render() {
    const { center, zoom, mapType, searchQuery, searchResults } = this.state;

    const b = (fn, ...args) => fn.bind(this, ...args);

    return (
      <div>
        <Navbar style={{ marginBottom: 0 }}>
          <Navbar.Header>
            <Navbar.Brand>Freemap3 React</Navbar.Brand>
            <Navbar.Toggle/>
          </Navbar.Header>
          <Navbar.Collapse>
            <Navbar.Form pullLeft>
              <form onSubmit={b(this.doSearch)}>
                <FormGroup>
                  <FormControl type="text" value={searchQuery} placeholder="Brusno"
                    onChange={b(this.updateSearchQuery)}/>
                </FormGroup>
                {' '}
                <Button type="submit" disabled={!searchQuery.length}>
                  Hľadaj
                </Button>
              </form>
            </Navbar.Form>
          </Navbar.Collapse>
        </Navbar>
        <Map ref="map" style={{ width: '100%', height: 'calc(100vh - 50px)' }} center={center} zoom={zoom}
          onMoveend={b(this.handleMapMoveend)}
          onZoom={b(this.handleMapZoom)}>

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

        {searchResults.map(({ id, lat, lon, name }) =>
          <Marker key={id} position={[ lat, lon ]} title={name}/>
        )}
        </Map>
      </div>
    );
  }
}

Main.propTypes = {
  params: React.PropTypes.object
}
