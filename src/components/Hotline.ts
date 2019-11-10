import 'leaflet-hotline';
import { Path, withLeaflet, PathProps } from 'react-leaflet';
import { Path as LPath } from 'leaflet';
// import { Hotline as LHotline } from 'leaflet-hotline'; TODO

interface Props extends PathProps {
  positions: (readonly [number, number, number])[];
  outlineWidth: number;
  outlineColor?: string;
  palette: any; // TODO
  min?: number;
  max?: number;
  weight?: number; // TODO ingerited from PathProps; should we actually extend from Path?
}

class HotlineInt extends Path<Props, LPath> {
  createLeafletElement(props: Props) {
    return (window['L'] as any).hotline(
      props.positions,
      this.getOptions(props),
    );
  }

  updateLeafletElement(fromProps: Props, toProps: Props) {
    if (toProps.positions !== fromProps.positions) {
      (this.leafletElement as any).setLatLngs(toProps.positions);
    }
  }
}

export const Hotline = withLeaflet(HotlineInt);
