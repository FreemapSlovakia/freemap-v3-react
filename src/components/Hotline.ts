import 'leaflet-hotline';
import { Path, withLeaflet, PathProps } from 'react-leaflet';
import { Path as LPath } from 'leaflet';
// import { Hotline as LHotline } from 'leaflet-hotline'; TODO

interface IProps extends PathProps {
  positions: (readonly [number, number, number])[];
  outlineWidth: number;
  outlineColor?: string;
  palette: any; // TODO
  min?: number;
  max?: number;
  weight?: number; // TODO ingerited from PathProps; should we actually extend from Path?
}

class Hotline extends Path<IProps, LPath> {
  createLeafletElement(props: IProps) {
    return (window['L'] as any).hotline(
      props.positions,
      this.getOptions(props),
    );
  }

  updateLeafletElement(fromProps: IProps, toProps: IProps) {
    if (toProps.positions !== fromProps.positions) {
      (this.leafletElement as any).setLatLngs(toProps.positions);
    }
  }
}

export default withLeaflet(Hotline);
