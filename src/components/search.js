import React from 'react';

import Navbar from 'react-bootstrap/lib/Navbar';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import Button from 'react-bootstrap/lib/Button';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';

export default class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchQuery: '',
      lat: this.props.lat, 
      lon: this.props.lon,
      zoom: this.props.zoom,      
    };
  }

  doSearch(e) {
    e.preventDefault();

    const { lat, lon, searchQuery, zoom } = this.state;
    // fetch(`https://www.freemap.sk/api/0.1/q/${encodeURIComponent(searchQuery)}&lat=${lat}&lon=${lon}&zoom=${zoom}`, {
    fetch(`https://nominatim.openstreetmap.org/search/${encodeURIComponent(searchQuery)}`
        + `?format=jsonv2&lat=${lat}&lon=${lon}&zoom=${zoom}&namedetails=1&extratags=1`, {
      method: 'GET'
    }).then(res => res.json()).then(data => {
      const searchResults = data.map((d, id) => ({ id, lat: d.lat, lon: d.lon, tags: { name: d.namedetails.name} }));
      this.props.onSearchResultsUpdate(searchResults);
    });
  }

  updateSearchQuery(e) {
    this.setState({ searchQuery: e.target.value });
  }

  render() {
    const b = (fn, ...args) => fn.bind(this, ...args);
    const {searchQuery} = this.state;
    return (
      <form onSubmit={b(this.doSearch)}>
        <Navbar.Form pullLeft>
          <FormGroup>
            <InputGroup>
              <FormControl type="text" value={searchQuery} placeholder="Brusno" onChange={b(this.updateSearchQuery)}/>
              <InputGroup.Button>
                <Button type="submit" disabled={!searchQuery.length}>
                  <Glyphicon glyph="search"/>
                </Button>
              </InputGroup.Button>
            </InputGroup>
          </FormGroup>
        </Navbar.Form>
      </form>
    );
  }
}

Search.propTypes = {
  lat: React.PropTypes.string,
  lon: React.PropTypes.string,
  zoom: React.PropTypes.number,
  onSearchResultsUpdate: React.PropTypes.func.isRequired
};