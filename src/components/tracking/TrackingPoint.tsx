import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { toLatLng } from 'fm3/geoutils';
import { TrackPoint } from 'fm3/types/trackingTypes';
import { Fragment, memo, useCallback } from 'react';
import { CircleMarker, Tooltip } from 'react-leaflet';

interface TrackingPointProps {
  tp: TrackPoint;
  width: number;
  color: string;
  language: string;
  onActivePointSet: (tp: TrackPoint | null) => void;
  onClick: () => void;
  interactive?: boolean;
}

// TODO to separate file
export const TrackingPoint = memo<TrackingPointProps>(
  ({ tp, width, color, language, onActivePointSet, onClick, interactive }) => {
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

    const handleMouseOver = useCallback(() => {
      if (onActivePointSet) {
        onActivePointSet(tp);
      }
    }, [tp, onActivePointSet]);

    const handleMouseOut = useCallback(() => {
      if (onActivePointSet) {
        onActivePointSet(null);
      }
    }, [onActivePointSet]);

    return (
      <CircleMarker
        interactive={interactive}
        stroke={false}
        center={toLatLng(tp)}
        radius={width}
        color={color}
        fillOpacity={1}
        bubblingMouseEvents={false}
        eventHandlers={{
          mouseover: handleMouseOver,
          mouseout: handleMouseOut,
          click: onClick,
        }}
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
): JSX.Element {
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
          <Fragment key={icon}>
            <FontAwesomeIcon key={icon} icon={icon} /> {text}
            {i < items.length - 1 ? '｜' : null}
          </Fragment>
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
