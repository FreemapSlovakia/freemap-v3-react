import * as React from 'react';
import { Tooltip, CircleMarker } from 'react-leaflet';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { ITrackPoint } from 'fm3/types/trackingTypes';
import { toLatLng } from 'fm3/geoutils';

interface TrackingPointProps {
  tp: ITrackPoint;
  width: number;
  color: string;
  language: string;
  onActivePointSet: (tp: ITrackPoint | null) => void;
  onClick: () => void;
}

// TODO to separate file
// eslint-disable-next-line
export const TrackingPoint = React.memo<TrackingPointProps>(
  ({ tp, width, color, language, onActivePointSet, onClick }) => {
    const df = new Intl.DateTimeFormat(language, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
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
          {tooltipText(df, tp)}
        </Tooltip>
      </CircleMarker>
    );
  },
);

// eslint-disable-next-line
export function tooltipText(
  df: Intl.DateTimeFormat,
  { battery, ts, gsmSignal, speed, message, altitude }: ITrackPoint,
  label?: String | null,
) {
  // TODO bearing

  const items: string[][] = [];

  if (typeof altitude === 'number') {
    items.push(['long-arrow-up', `${altitude} m`]); // TODO format number
  }

  if (typeof speed === 'number') {
    items.push(['dashboard', `${speed * 3.6} km/h`]); // TODO format number
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
