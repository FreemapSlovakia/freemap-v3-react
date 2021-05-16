import { colors } from 'fm3/constants';
import Leaflet, { BaseIconOptions, Icon } from 'leaflet';
import { ReactElement, useEffect, useMemo, useRef } from 'react';
import { render } from 'react-dom';
import { Marker, MarkerProps } from 'react-leaflet';

interface IconProps {
  label?: string | number;
  color?: string;
  image?: string;
  faIcon?: ReactElement;
  cacheKey?: string;
}

interface Props extends MarkerProps, IconProps {
  autoOpenPopup?: boolean;
}

export const markerIconOptions = {
  iconSize: [24, 40] as [number, number],
  iconAnchor: [12, 37] as [number, number],
  popupAnchor: [0, -34] as [number, number],
};

export function RichMarker({
  autoOpenPopup,
  cacheKey,
  ...restProps
}: Props): ReactElement {
  const markerRef = useRef<Leaflet.Marker | null>(null);

  useEffect(() => {
    if (autoOpenPopup && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [autoOpenPopup]);

  const icon = useMemo(
    () =>
      new MarkerLeafletIcon({
        ...markerIconOptions,
        icon: <MarkerIcon {...restProps} />,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cacheKey ?? 'default', restProps.color, restProps.image, restProps.label],
  );

  return <Marker {...restProps} icon={icon} ref={markerRef} />;
}

export class MarkerLeafletIcon extends Icon<
  BaseIconOptions & { icon: ReactElement }
> {
  createIcon(oldIcon?: HTMLElement): HTMLElement {
    const reuse = oldIcon && oldIcon.tagName === 'DIV';

    const div = oldIcon && reuse ? oldIcon : document.createElement('div');

    (this as any)._setIconStyles(div, 'icon');

    render(this.options.icon, div);

    return div;
  }

  createShadow(oldIcon?: HTMLElement): HTMLElement {
    return oldIcon || (null as any as HTMLElement);
  }
}

export function MarkerIcon({
  image,
  faIcon,
  color = colors.normal,
  label,
}: IconProps): ReactElement {
  return (
    <>
      <svg
        x="0px"
        y="0px"
        viewBox="0 0 310 512"
        xmlns="http://www.w3.org/2000/svg"
      >
        {!!(label || image || faIcon) && (
          <defs>
            <radialGradient
              id={`gradient-${color}`}
              gradientUnits="userSpaceOnUse"
              cx="155"
              cy="160"
              r="132"
              gradientTransform="matrix(0.9, 0, 0, 0.9, 13.8, 17.9)"
            >
              <stop offset="0" style={{ stopColor: '#fff' }} />
              <stop offset="0.799" style={{ stopColor: ' #ddd' }} />
              <stop offset="1" style={{ stopColor: color }} />
            </radialGradient>
          </defs>
        )}

        <path
          d="M 156.063 11.734 C 74.589 11.734 8.53 79.093 8.53 162.204 C 8.53 185.48 13.716 207.552 22.981 227.212 C 23.5 228.329 156.063 493.239 156.063 493.239 L 287.546 230.504 C 297.804 210.02 303.596 186.803 303.596 162.204 C 303.596 79.093 237.551 11.734 156.063 11.734 Z"
          style={{
            strokeWidth: 10,
            fill: color,
            strokeOpacity: 0.5,
            stroke: 'white',
          }}
        />

        {!!(label || image || faIcon) && (
          <ellipse
            cx={154.12}
            cy={163.702}
            rx={119.462}
            ry={119.462}
            style={{
              strokeWidth: 10,
              strokeOpacity: 0.6,
              fill: `url(#gradient-${color})`,
            }}
          />
        )}

        {label && (
          <text
            x={150}
            y={227.615}
            style={{
              fill: 'rgba(0, 0, 0, 0.5)',
              fontSize: '184px',
              fontWeight: 'bold',
              whiteSpace: 'pre',
              fontFamily: 'Sans-Serif',
              textAnchor: 'middle',
            }}
          >
            {label}
          </text>
        )}

        {image && (
          <image x={74} y={84} width={160} height={160} xlinkHref={image} />
        )}
      </svg>

      {/* {image && (
        <img className="fa-icon-inside-leaflet-icon-holder" src={image} />
      )} */}

      {faIcon && (
        <div className="fa-icon-inside-leaflet-icon-holder">{faIcon}</div>
      )}
    </>
  );
}
