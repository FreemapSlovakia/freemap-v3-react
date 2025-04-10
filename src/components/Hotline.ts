import { createPathComponent, PathProps } from '@react-leaflet/core';
import { LatLngExpression, Polyline } from 'leaflet';
import 'leaflet-hotline';

interface Props extends PathProps {
  positions: LatLngExpression[];
  outlineWidth: number;
  outlineColor?: string;
  palette: Record<number, string>;
  min?: number;
  max?: number;
  weight?: number; // TODO inherited from PathProps; should we actually extend from Path?
}

export const Hotline = createPathComponent<Polyline, Props>(
  (props, context) => {
    return {
      instance: (window.L as any).hotline(props.positions, props),
      context,
    };
  },

  (instance, props, prevProps) => {
    if (props.positions !== prevProps.positions) {
      instance.setLatLngs(props.positions);
    }
  },
);
