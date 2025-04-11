import Leaflet, { BaseIconOptions, Icon } from 'leaflet';
import { CSSProperties, ReactElement, useEffect, useMemo, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Marker, MarkerProps } from 'react-leaflet';
import { assertGuard } from 'typia';
import { MarkerType } from '../actions/objectsActions.js';
import { colors } from '../constants.js';

const textStyle: CSSProperties = {
  fill: 'rgba(0, 0, 0, 0.5)',
  fontSize: '184px',
  fontWeight: 'bold',
  whiteSpace: 'pre',
  fontFamily: 'Sans-Serif',
  textAnchor: 'middle',
};

interface IconProps {
  label?: string | number;
  color?: string;
  image?: string;
  faIcon?: ReactElement;
  cacheKey?: string;
  imageOpacity?: number;
  selectedIconValue?: string;
  markerType?: MarkerType;
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
  cacheKey = 'default',
  markerType = 'pin',
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
        iconAnchor:
          markerType === 'ring' || markerType === 'square'
            ? [12, 12]
            : markerIconOptions.iconAnchor,
        tooltipAnchor:
          markerType === 'ring' || markerType === 'square'
            ? [0, -10]
            : [0, -35],
        iconSize: markerIconOptions.iconSize,
        icon: <MarkerIcon markerType={markerType} {...restProps} />,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cacheKey, restProps.color, restProps.image, restProps.label, markerType],
  );

  return <Marker {...restProps} icon={icon} key={markerType} ref={markerRef} />;
}

export class MarkerLeafletIcon extends Icon<
  BaseIconOptions & { icon: ReactElement }
> {
  createIcon(oldIcon?: HTMLElement & { _fm_root?: HTMLElement }): HTMLElement {
    const reuse = oldIcon?.tagName === 'DIV';

    const div = (
      reuse ? oldIcon : document.createElement('div')
    ) as HTMLElement & { _fm_root?: Root };

    if (!div._fm_root) {
      assertGuard<{ _setIconStyles: (el: HTMLElement, str: string) => void }>(
        this,
      );

      this._setIconStyles(div, 'icon');

      div._fm_root = createRoot(div);

      div._fm_root.render(this.options.icon);
    }

    div._fm_root.render(this.options.icon);

    return div;
  }

  createShadow(oldIcon?: HTMLElement): HTMLElement {
    return oldIcon ?? document.createElement('div');
  }
}

export function MarkerIcon({
  image,
  imageOpacity,
  faIcon,
  color = colors.normal,
  label,
  markerType,
}: IconProps): ReactElement {
  return (
    <>
      {markerType === 'ring' ? (
        <svg
          x="0px"
          y="0px"
          viewBox="0 0 310 310"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse
            cx={155}
            cy={155}
            rx={135}
            ry={135}
            style={{
              strokeWidth: 10,
              fill: color,
              strokeOpacity: 0.5,
              stroke: color,
            }}
          />

          {!!(label || image || faIcon) && (
            <ellipse
              cx={155}
              cy={155}
              rx={110}
              ry={110}
              style={{
                strokeWidth: 10,
                strokeOpacity: 0.6,
                fill: `white`,
              }}
            />
          )}

          {label && (
            <text x={150} y={150} style={textStyle}>
              {label}
            </text>
          )}

          {image && (
            <image
              x={90}
              y={90}
              width={140}
              height={140}
              xlinkHref={image}
              opacity={imageOpacity}
            />
          )}
        </svg>
      ) : markerType === 'square' ? (
        <svg
          x="0px"
          y="0px"
          viewBox="0 0 310 310"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x={30}
            y={30}
            width={240}
            height={240}
            rx={20}
            ry={20}
            style={{
              strokeWidth: 10,
              strokeOpacity: 0.6,
              fill: color,
              stroke: color,
            }}
          />

          {!!(label || image || faIcon) && (
            <rect
              x={50}
              y={50}
              width={200}
              height={200}
              rx={20}
              ry={20}
              style={{
                strokeWidth: 10,
                strokeOpacity: 0.6,
                fill: `white`,
              }}
            />
          )}

          {label && (
            <text
              x={150}
              y={150}
              style={{
                fill: 'rgba(0, 0, 0, 0.5)',
                fontSize: '144px',
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
            <image
              x={90}
              y={90}
              width={130}
              height={130}
              xlinkHref={image}
              opacity={imageOpacity}
            />
          )}
        </svg>
      ) : (
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
                <stop offset="0.8" style={{ stopColor: ' #ddd' }} />
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
            <text x={150} y={227.615} style={textStyle}>
              {label}
            </text>
          )}

          {image && (
            <image
              x={78}
              y={84}
              width={160}
              height={160}
              xlinkHref={image}
              opacity={imageOpacity}
            />
          )}
        </svg>
      )}

      {faIcon && (
        <div className="fa-icon-inside-leaflet-icon-holder">{faIcon}</div>
      )}
    </>
  );
}
