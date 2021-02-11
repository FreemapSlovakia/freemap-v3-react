import { toLatLng } from 'fm3/geoutils';
import { TrackPoint } from 'fm3/types/trackingTypes';
import { Fragment, memo, ReactElement, useCallback } from 'react';
import {
  FaBatteryEmpty,
  FaBatteryFull,
  FaBatteryHalf,
  FaBatteryQuarter,
  FaBatteryThreeQuarters,
  FaClock,
  FaLongArrowAltUp,
  FaRegComment,
  FaSignal,
  FaTachometerAlt,
} from 'react-icons/fa';
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

  const items: [string, ReactElement, string][] = [];

  if (typeof altitude === 'number') {
    // eslint-disable-next-line react/jsx-key
    items.push(['alt', <FaLongArrowAltUp />, `${nf.format(altitude)} m`]);
  }

  if (typeof speed === 'number') {
    items.push([
      'speed',
      // eslint-disable-next-line react/jsx-key
      <FaTachometerAlt />,
      `${nf.format(speed * 3.6)} km/h`,
    ]);
  }

  if (typeof gsmSignal === 'number') {
    // eslint-disable-next-line react/jsx-key
    items.push(['signal', <FaSignal />, `${gsmSignal} %`]);
  }

  if (typeof battery === 'number') {
    items.push([
      'battery',
      battery < 12.5 ? (
        <FaBatteryEmpty />
      ) : battery < 25 + 12.5 ? (
        <FaBatteryQuarter />
      ) : battery < 50 + 12.5 ? (
        <FaBatteryHalf />
      ) : battery < 75 + 12.5 ? (
        <FaBatteryThreeQuarters />
      ) : (
        <FaBatteryFull />
      ),
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
        <FaClock /> {df.format(ts)}
      </div>
      <div>
        {items.map(([key, icon, text], i) => (
          <Fragment key={key}>
            {icon} {text}
            {i < items.length - 1 ? '｜' : null}
          </Fragment>
        ))}
      </div>
      {message && (
        <div>
          <FaRegComment /> {message}
        </div>
      )}
    </div>
  );
}
