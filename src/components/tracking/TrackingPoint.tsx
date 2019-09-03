import * as React from 'react';
import { Tooltip, CircleMarker } from 'react-leaflet';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { TrackPoint } from 'fm3/types/trackingTypes';
import { toLatLng } from 'fm3/geoutils';

interface TrackingPointProps {
  tp: TrackPoint;
  width: number;
  color: string;
  language: string;
  onActivePointSet: (tp: TrackPoint | null) => void;
  onClick: () => void;
}

// TODO to separate file
export const TrackingPoint = React.memo<TrackingPointProps>(
  ({ tp, width, color, language, onActivePointSet, onClick }) => {
    const df = new Intl.DateTimeFormat(language, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const nf = Intl.NumberFormat(language, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });

    const handleMouseOver = React.useCallback(() => {
      if (onActivePointSet) {
        onActivePointSet(tp);
      }
    }, [tp, onActivePointSet]);

    const handleMouseOut = React.useCallback(() => {
      if (onActivePointSet) {
        onActivePointSet(null);
      }
    }, [onActivePointSet]);

    return (
      <CircleMarker
        stroke={false}
        center={toLatLng(tp)}
        radius={width}
        color={color}
        fillOpacity={1}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        onClick={onClick}
      >
        <Tooltip direction="top" offset={[0, -1.5 * width]}>
          {tooltipText(df, nf, tp)}
        </Tooltip>
      </CircleMarker>
    );
  },
);

export function tooltipText(
  df: Intl.DateTimeFormat,
  nf: Intl.NumberFormat,
  { battery, ts, gsmSignal, speed, message, altitude }: TrackPoint,
  label?: string | null,
) {
  // TODO bearing

  const items: string[][] = [];

  if (typeof altitude === 'number') {
    items.push(['long-arrow-up', `${nf.format(altitude)} m`]);
  }

  if (typeof speed === 'number') {
    items.push(['dashboard', `${nf.format(speed * 3.6)} km/h`]);
  }

  if (typeof gsmSignal === 'number') {
    items.push(['signal', `${gsmSignal} %`]);
  }

  if (typeof battery === 'number') {
    items.push([
      `battery-${
        battery < 12.5
          ? 0
          : battery < 25 + 12.5
          ? 1
          : battery < 50 + 12.5
          ? 2
          : battery < 75 + 12.5
          ? 3
          : 4
      }`,
      `${battery} %`,
    ]);
  }

  return (
    <div>
      {label && (
        <div>
          <b>{label}</b>
        </div>
      )}
      <div>
        <FontAwesomeIcon icon="clock-o" /> {df.format(ts)}
      </div>
      <div>
        {items.map(([icon, text], i) => (
          <React.Fragment key={icon}>
            <FontAwesomeIcon key={icon} icon={icon} /> {text}
            {i < items.length - 1 ? '｜' : null}
          </React.Fragment>
        ))}
      </div>
      {message && (
        <div>
          <FontAwesomeIcon icon="bubble-o" /> {message}
        </div>
      )}
    </div>
  );
}
