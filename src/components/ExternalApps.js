import axios from 'axios';
import React from 'react';
import PropTypes from 'prop-types';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';

export default function ExternalApps({ lat, lon, zoom, mapType }) {
  function openIn(where) {
    switch (where) {
      case 'osm.org':
        window.open(`https://www.openstreetmap.org/#map=${zoom > 19 ? 19 : zoom}/${lat.toFixed(5)}/${lon.toFixed(5)}`);
        break;
      case 'osm.org/id':
        window.open(`https://www.openstreetmap.org/edit?editor=id#map=${zoom}/${lat.toFixed(5)}/${lon.toFixed(5)}`);
        break;
      case 'josm': {
        const bounds = getMapLeafletElement().getBounds();
        axios.get('http://localhost:8111/load_and_zoom', {
          params: {
            left: bounds.getWest(),
            right: bounds.getEast(),
            top: bounds.getNorth(),
            bottom: bounds.getSouth(),
          },
        });
        break;
      }
      case 'hiking.sk': {
        const point = L.CRS.EPSG3857.project(L.latLng(lat, lon));
        window.open(`https://mapy.hiking.sk/?zoom=${zoom > 15 ? 15 : zoom}&lon=${point.x}&lat=${point.y}&layers=00B00FFFTTFTTTTFFFFFFTTT`);
        break;
      }
      case 'google':
        window.open(`https://www.google.sk/maps/@${lat},${lon},${zoom}z`);
        break;
      case 'mapy.cz/ophoto':
        window.open(`https://mapy.cz/zakladni?x=${lon}&y=${lat}&z=${zoom > 19 ? 19 : zoom}&base=ophoto`);
        break;
      case 'oma.sk':
        window.open(`http://redirect.oma.sk/?lat=${lat}&lon=${lon}&zoom=${zoom}&mapa=${mapType}`);
        break;
      default:
        break;
    }
  }

  return (
    <ListGroup>
      <ListGroupItem onClick={() => openIn('osm.org')}>OpenStreetMap</ListGroupItem>
      <ListGroupItem onClick={() => openIn('oma.sk')}>OMA</ListGroupItem>
      <ListGroupItem onClick={() => openIn('google')}>Google Mapy</ListGroupItem>
      <ListGroupItem onClick={() => openIn('hiking.sk')}>Hiking.sk</ListGroupItem>
      <ListGroupItem onClick={() => openIn('mapy.cz/ophoto')}>Mapy.cz Letecká</ListGroupItem>
      <ListGroupItem divider />
      <ListGroupItem onClick={() => openIn('josm')}>Editor JOSM</ListGroupItem>
      <ListGroupItem onClick={() => openIn('osm.org/id')}>Editor iD</ListGroupItem>
    </ListGroup>
  );
}


ExternalApps.propTypes = {
  lat: PropTypes.number.isRequired,
  lon: PropTypes.number.isRequired,
  zoom: PropTypes.number.isRequired,
  mapType: PropTypes.string,
};
