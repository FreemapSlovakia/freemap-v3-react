import React from 'react';
import { Map, TileLayer, Marker, LayersControl } from 'react-leaflet';
import FileSaver from 'file-saver';
import Navbar from 'react-bootstrap/lib/Navbar';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Form from 'react-bootstrap/lib/Form';
import FormControl from 'react-bootstrap/lib/FormControl';
import NavDropdown from 'react-bootstrap/lib/NavDropdown';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Panel from 'react-bootstrap/lib/Panel';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Button from 'react-bootstrap/lib/Button';
import { hashHistory } from 'react-router'
import mapDefinitions from './mapDefinitions';

const cleanState = {
};

export default class Main extends React.Component {

  constructor(props) {
    super(props);

    var mapType = props.params.mapType || 'T'
    var zoom = parseInt(props.params.zoom) || 8
    var lat = props.params.lat || 48.70714
    var lon = props.params.lon || 19.4995

    this.state = Object.assign({}, cleanState, {
      map: mapType,
      center: L.latLng(lat, lon),
      zoom: zoom,
      searchQuery: '',
      searchResults: []
    }, {});

  }

  componentDidUpdate() {
    var zoom = this.state['zoom']
    var lat = this.state['center'].lat.toFixed(5)
    var lon = this.state['center'].lng.toFixed(5)
    var mapType = this.state['map']
    var p = this.props.params
    if(p.lat != lat || p.lon != lon || p.zoom != zoom || p.mapType != mapType)
      hashHistory.push('/'+mapType+'/'+zoom+'/'+lat+'/'+lon)
  }


  handleMapMoveend(e) {
    this.setState({ center: e.target.getCenter() });
  }

  handleMapZoom(e) {
    this.setState({ zoom: e.target.getZoom() });
  }


  handleMapClick(e) {
    console.log('map clicked')
  }


  handleMapChange(map) {
    this.setState({ map });
  }

  updateSearchQuery(e){
    this.setState({ searchQuery: e.target.value });
  }

  doSearch(){
    var q = this.state['searchQuery']
    var lat = this.state['lat']
    var lon = this.state['lon']
    var url = 'http://www.freemap.sk/api/0.1/q/'+q+'&lat='+lat+'&lon='+lat
    var that = this
    fetch(url, {
        method: 'GET'
      }).then(res => res.json()).then(data => {
        var counter = 1
        var results = data.map((d) => {
          counter++
          return {id: counter, lat : d.lat, lon: d.lon, name: d.name}
        })
        if(results.length > 0){
          var firstResult = results[0]
          this.setState({ searchResults: results, center: L.latLng(firstResult.lat, firstResult.lon) , zoom: 14  });
        } else {
          this.setState({ searchResults: results });
        }
        
      });
  }

  render() {
    const {center, zoom, map} = this.state;

    const t = key => messages[key] || key;

    return (
      <div>
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>Freemap3 React</Navbar.Brand>
            <Navbar.Toggle/>
          </Navbar.Header>
          <Navbar.Collapse>
            <Form inline>
              <FormControl
                type="text"
                value={this.state.searchQuery}
                placeholder="Brusno"
                onChange={this.updateSearchQuery.bind(this)}
              />
              <Button onClick={this.doSearch.bind(this)}>Hľadaj</Button>
            </Form>
          </Navbar.Collapse>
        </Navbar>
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <Panel className="map-panel">
                <Map ref="map" style={{ width: '100%', height: '500px' }} center={center} zoom={zoom}
                    onMoveend={this.handleMapMoveend.bind(this)}
                    onClick={this.handleMapClick.bind(this)}
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
              </Panel>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
