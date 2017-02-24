import React from 'react';
import { Map, TileLayer, Marker, LayersControl } from 'react-leaflet';
import Navbar from 'react-bootstrap/lib/Navbar';
import Form from 'react-bootstrap/lib/Form';
import FormControl from 'react-bootstrap/lib/FormControl';
import Button from 'react-bootstrap/lib/Button';
import { hashHistory } from 'react-router'
import mapDefinitions from './mapDefinitions';

const cleanState = {
};

export default class Main extends React.Component {

  constructor(props) {
    super(props);

    const mapType = props.params.mapType || 'T'
    const zoom = parseInt(props.params.zoom) || 8
    const lat = props.params.lat || 48.70714
    const lon = props.params.lon || 19.4995

    this.state = Object.assign({}, cleanState, {
      map: mapType, // TODO: rename attribute name from map to mapType!!
      center: L.latLng(lat, lon),
      zoom: zoom,
      searchQuery: '',
      searchResults: []
    }, {});

  }

  componentDidUpdate() {
    const zoom = this.state.zoom
    const lat = this.state.center.lat.toFixed(5)
    const lon = this.state.center.lng.toFixed(5)
    const mapType = this.state.map
    const p = this.props.params
    if(p.lat !== lat || p.lon !== lon || p.zoom !== zoom || p.mapType !== mapType)
      hashHistory.push(`/${mapType}/${zoom}/${lat}/${lon}`)
  }

  handleMapMoveend(e) {
    this.setState({ center: e.target.getCenter() });
  }

  handleMapZoom(e) {
    this.setState({ zoom: e.target.getZoom() });
  }

  handleMapChange(map) {
    this.setState({ map });
  }

  updateSearchQuery(e){
    this.setState({ searchQuery: e.target.value });
  }

  doSearch(){
    const q = this.state['searchQuery']
    const lat = this.state['lat']
    const lon = this.state['lon']
    const url = 'http://www.freemap.sk/api/0.1/q/'+q+'&lat='+lat+'&lon='+lon
    fetch(url, {
        method: 'GET'
      }).then(res => res.json()).then(data => {
        const results = data.map((d, id) => {
          return {id, lat : d.lat, lon: d.lon, name: d.name}
        })
        if(results.length > 0){
          const firstResult = results[0]
          this.setState({ searchResults: results, center: L.latLng(firstResult.lat, firstResult.lon) , zoom: 14  });
        } else {
          this.setState({ searchResults: results });
        }
        
      });
  }

  render() {
    const {center, zoom, map} = this.state;

    return (
      <div>
        <Navbar style={{ 'marginBottom': 0 }}>
          <Navbar.Header>
            <Navbar.Brand>Freemap3 React</Navbar.Brand>
            <Navbar.Toggle/>
          </Navbar.Header>
          <Navbar.Collapse>
            <Form inline style={{'marginTop': '8px'}}>
              <FormControl
                type="text"
                value={this.state.searchQuery}
                placeholder="Brusno"
                onChange={this.updateSearchQuery.bind(this)}
              />
              <Button disabled={this.state.searchQuery.length == 0} 
                onClick={this.doSearch.bind(this)}>
                Hľadaj
              </Button>
            </Form>
          </Navbar.Collapse>
        </Navbar>
        <Map ref="map" style={{ width: '100%', height: 'calc(100vh - 50px)' }} center={center} zoom={zoom}
            onMoveend={this.handleMapMoveend.bind(this)}
            onZoom={this.handleMapZoom.bind(this)}>

          <LayersControl position="topright">
            {
              mapDefinitions.map(({ name, type, url, attribution, maxZoom, minZoom }) =>
                <LayersControl.BaseLayer key={type} name={name} checked={map === type}>
                  <TileLayer attribution={attribution} url={url} onAdd={this.handleMapChange.bind(this, type)}
                    maxZoom={maxZoom} minZoom={minZoom}/>
                </LayersControl.BaseLayer>
              )
            }
          </LayersControl>

          {this.state['searchResults'].map(({id, lat, lon, name}) =>
            <Marker key={id} position={[ lat, lon ]} title={name} />
          )}
        </Map>
      </div>
    );
  }
}
