import React from 'react';
import { Map, TileLayer, Marker, LayersControl } from 'react-leaflet';
import Navbar from 'react-bootstrap/lib/Navbar';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import Button from 'react-bootstrap/lib/Button';
import Row from 'react-bootstrap/lib/Row';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import { hashHistory as history } from 'react-router'
import mapDefinitions from './mapDefinitions';

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
      searchResults: []
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

    const { lat, lon, searchQuery: q } = this.state;
    fetch(`http://www.freemap.sk/api/0.1/q/${encodeURIComponent(q)}&lat=${lat}&lon=${lon}`, {
      method: 'GET'
    }).then(res => res.json()).then(data => {
      const searchResults = data.map((d, id) => ({id, lat: d.lat, lon: d.lon, name: d.name}));
      if (searchResults.length) {
        const { lat, lon } = searchResults[0];
        this.setState({ searchResults, lat, lon, zoom: 14  });
      } else {
        this.setState({ searchResults });
      }
    });
  }

  render() {
    const { lat, lon, zoom, mapType, searchQuery, searchResults } = this.state;

    const b = (fn, ...args) => fn.bind(this, ...args);

    return (
      <div className="container-fluid">
        <Row>
          <Navbar fluid style={{ marginBottom: 0 }}>
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
                    <Glyphicon glyph="search"/>
                  </Button>
                </form>
              </Navbar.Form>
            </Navbar.Collapse>
          </Navbar>
          <Map ref="map" style={{ height: 'calc(100vh - 52px)' }} center={[ lat, lon ]} zoom={zoom}
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
        </Row>
      </div>
    );
  }
}

Main.propTypes = {
  params: React.PropTypes.object
}
