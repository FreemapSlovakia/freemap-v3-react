import { Marker } from 'react-leaflet';

export default class MarkerWithAutoOpeningPopup extends Marker {
  componentDidMount() {
    super.componentDidMount();
    this.leafletElement.openPopup();
  }

  componentDidUpdate(prevProps, prevState) {
    super.componentDidUpdate(prevProps, prevState);
    this.leafletElement.openPopup();
  }
}
