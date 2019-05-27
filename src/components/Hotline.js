import PropTypes from 'prop-types';
import 'leaflet-hotline';
import { Path, withLeaflet } from 'react-leaflet';

class Hotline extends Path {
  static propTypes = {
    positions: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.number),
      PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    ]).isRequired,
    weight: PropTypes.number,
    outlineWidth: PropTypes.number,
    outlineColor: PropTypes.string,
    palette: PropTypes.shape({}), // TODO
    min: PropTypes.number,
    max: PropTypes.number,
  };

  createLeafletElement(props) {
    return new L.Hotline(props.positions, this.getOptions(props));
  }

  updateLeafletElement(fromProps, toProps) {
    if (toProps.positions !== fromProps.positions) {
      this.leafletElement.setLatLngs(toProps.positions);
    }
  }
}

export default withLeaflet(Hotline);
