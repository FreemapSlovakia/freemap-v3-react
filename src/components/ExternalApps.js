import React from 'react';
import PropTypes from 'prop-types';
import NavDropdown from 'react-bootstrap/lib/NavDropdown';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import 'whatwg-fetch';

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
        fetch(`http://localhost:8111/load_and_zoom?left=${bounds.getWest()}&right=${bounds.getEast()}&top=${bounds.getNorth()}&bottom=${bounds.getSouth()}`);
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
        console.log(`http://redirect.oma.sk/?lat=${lat}&lon=${lon}&zoom=${zoom}&mapa=${mapType}`);
        window.open(`http://redirect.oma.sk/?lat=${lat}&lon=${lon}&zoom=${zoom}&mapa=${mapType}`);
        break;
      default:
        break;
    }
  }

  return (
    <NavDropdown title={<span><FontAwesomeIcon icon="external-link" /> Otvor na</span>} id="open_in-menu-items">
      <MenuItem onClick={() => openIn('osm.org')}>OpenStreetMap</MenuItem>
      <MenuItem onClick={() => openIn('oma.sk')}>OMA</MenuItem>
      <MenuItem onClick={() => openIn('google')}>Google Mapy</MenuItem>
      <MenuItem onClick={() => openIn('hiking.sk')}>Hiking.sk</MenuItem>
      <MenuItem onClick={() => openIn('mapy.cz/ophoto')}>Mapy.cz Letecká</MenuItem>
      <MenuItem divider />
      <MenuItem onClick={() => openIn('josm')}>Editor JOSM</MenuItem>
      <MenuItem onClick={() => openIn('osm.org/id')}>Editor iD</MenuItem>
    </NavDropdown>
  );
}


ExternalApps.propTypes = {
  lat: PropTypes.number.isRequired,
  lon: PropTypes.number.isRequired,
  zoom: PropTypes.number.isRequired,
  mapType: PropTypes.string,
};
