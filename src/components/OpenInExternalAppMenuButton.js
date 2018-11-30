import axios from 'axios';
import React from 'react';
import PropTypes from 'prop-types';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Button from 'react-bootstrap/lib/Button';
import Overlay from 'react-bootstrap/lib/Overlay';
import Popover from 'react-bootstrap/lib/Popover';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import injectL10n from 'fm3/l10nInjector';

class OpenInExternalAppMenuButton extends React.Component {
  static propTypes = {
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    zoom: PropTypes.number.isRequired,
    mapType: PropTypes.string,
    expertMode: PropTypes.bool,
    t: PropTypes.func.isRequired,
  };

  state = {
    show: false,
  }

  setButton = (button) => {
    this.button = button;
  };

  handleButtonClick = () => {
    this.setState({ show: true });
  }

  handleHide = () => {
    this.setState({ show: false });
  }

  openIn(where) {
    this.setState({ show: false });

    const { lat, lon, zoom, mapType } = this.props;

    switch (where) {
      case 'osm.org':
        window.open(`https://www.openstreetmap.org/#map=${zoom > 19 ? 19 : zoom}/${lat.toFixed(5)}/${lon.toFixed(5)}`);
        break;
      case 'osm.org/id':
        window.open(`https://www.openstreetmap.org/edit?editor=id#map=${zoom}/${lat.toFixed(5)}/${lon.toFixed(5)}`);
        break;
      case 'josm': {
        const bounds = getMapLeafletElement().getBounds();
        const opts = {
          params: {
            left: bounds.getWest(),
            right: bounds.getEast(),
            top: bounds.getNorth(),
            bottom: bounds.getSouth(),
          },
        };
        [['http', 8111], ['https', 8112]].forEach(([proto, port]) => {
          axios.get(`${proto}//localhost:${port}/load_and_zoom`, opts);
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
      case 'mojamapa.sk':
        window.open(`https://mojamapa.sk?op=C-${lon}-${lat}`);
        break;
      case 'routing-debug':
        window.open(`https://routing.epsilon.sk/debug.php?lat=${lat}&lon=${lon}&zoom=${zoom}&profil=${{ C: 'bike', K: 'ski', A: 'car' }[mapType] || 'foot'}`);
        break;
      default:
        break;
    }
  }

  render() {
    const { t } = this.props;

    return (
      <>
        <Button ref={this.setButton} onClick={this.handleButtonClick} title={t('external.openInExternal')}>
          <FontAwesomeIcon icon="external-link" />
        </Button>
        <Overlay rootClose placement="bottom" show={this.state.show} onHide={this.handleHide} target={() => this.button}>
          <Popover id="popover-trigger-click-root-close" className="fm-menu">
            <ul>
              <MenuItem onClick={() => this.openIn('osm.org')}>{t('external.osm')}</MenuItem>
              <MenuItem onClick={() => this.openIn('oma.sk')}>{t('external.oma')}</MenuItem>
              <MenuItem onClick={() => this.openIn('google')}>{t('external.googleMaps')}</MenuItem>
              <MenuItem onClick={() => this.openIn('hiking.sk')}>{t('external.hiking_sk')}</MenuItem>
              <MenuItem onClick={() => this.openIn('mapy.cz/ophoto')}>{t('external.mapy_cz-aerial')}</MenuItem>
              <MenuItem onClick={() => this.openIn('mojamapa.sk')}>{t('external.mojamapa_sk')}</MenuItem>
              <MenuItem divider />
              {this.props.expertMode && <MenuItem onClick={() => this.openIn('josm')}>{t('external.josm')}</MenuItem>}
              <MenuItem onClick={() => this.openIn('osm.org/id')}>{t('external.id')}</MenuItem>
              {this.props.expertMode && <MenuItem divider />}
              {this.props.expertMode && <MenuItem onClick={() => this.openIn('routing-debug')}>{t('external.routing-debug')}</MenuItem>}
            </ul>
          </Popover>
        </Overlay>
      </>
    );
  }
}

export default injectL10n()(OpenInExternalAppMenuButton);
