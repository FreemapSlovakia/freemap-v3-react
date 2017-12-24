import PropTypes from 'prop-types';
import { Polyline, PropTypes as LeafletPropTypes } from 'react-leaflet';
import 'leaflet-hotline';

export default class Hotline extends Polyline {
  static propTypes = {
    positions: PropTypes.oneOfType([
      LeafletPropTypes.latlngList,
      PropTypes.arrayOf(LeafletPropTypes.latlngList),
    ]).isRequired,
    weight: PropTypes.number,
    outlineWidth: PropTypes.number,
    outlineColor: PropTypes.string,
    palette: PropTypes.shape({}), // TODO
    min: PropTypes.number,
    max: PropTypes.number,
  }

  createLeafletElement(props) {
    return new L.Hotline(props.positions, this.getOptions(props));
  }

  updateLeafletElement(fromProps, toProps) {
    if (toProps.positions !== fromProps.positions) {
      this.leafletElement.setLatLngs(toProps.positions);
    }
  }
}
