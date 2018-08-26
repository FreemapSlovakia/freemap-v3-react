import PropTypes from 'prop-types';
import 'react-leaflet-bing/src/leaflet.bing';
import { GridLayer, withLeaflet } from 'react-leaflet';

class BingLayer extends GridLayer {
  static propTypes = {
    bingkey: PropTypes.string.isRequired,
  };

  // eslint-disable-next-line
  createLeafletElement(props) {
    return L.bingLayer(props.bingkey, this.getOptions(props));
  }
}

export default withLeaflet(BingLayer);
