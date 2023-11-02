import { colors } from 'fm3/constants';
import { RootState } from 'fm3/reducers';
import Leaflet, { BaseIconOptions, Icon } from 'leaflet';
import { ReactElement, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Marker, MarkerProps } from 'react-leaflet';
import { useSelector } from 'react-redux';

interface IconProps {
  label?: string | number;
  color?: string;
  image?: string;
  faIcon?: ReactElement;
  cacheKey?: string;
  imageOpacity?: number;
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
    const reuse = oldIcon?.tagName === 'DIV';

    const div = (reuse ? oldIcon : document.createElement('div')) as any;

    if (!div._fm_root) {
      (this as any)._setIconStyles(div, 'icon');

      div._fm_root = createRoot(div);

      div._fm_root.render(this.options.icon);
    }

    div._fm_root.render(this.options.icon);

    return div;
  }

  createShadow(oldIcon?: HTMLElement): HTMLElement {
    return oldIcon || (null as any as HTMLElement);
  }
}

export function MarkerIcon({
  image,
  imageOpacity,
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
          <image
            x={74}
            y={84}
            width={160}
            height={160}
            xlinkHref={image}
            opacity={imageOpacity}
          />
        )}
      </svg>

      {faIcon && (
        <div className="fa-icon-inside-leaflet-icon-holder">{faIcon}</div>
      )}
    </>
  );
}

export function ObjectMarker({
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

  const selectedIconValue = useSelector(
    (state: RootState) => state.main.selectedIcon,
  );

  const icon = useMemo(
    () =>
      new MarkerLeafletIcon({
        ...markerIconOptions,
        icon: (
          <MarkerObjectIcon
            selectedIconValue={selectedIconValue}
            {...restProps}
          />
        ),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      cacheKey ?? 'default',
      restProps.color,
      restProps.image,
      restProps.label,
      selectedIconValue,
    ],
  );

  return <Marker {...restProps} icon={icon} ref={markerRef} />;
}

export function MarkerObjectIcon({
  image,
  imageOpacity,
  faIcon,
  color = colors.normal,
  label,
  selectedIconValue,
}: IconProps & { selectedIconValue: string }): ReactElement {
  let renderContent: ReactElement = (
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
          <image
            x={74}
            y={84}
            width={160}
            height={160}
            xlinkHref={image}
            opacity={imageOpacity}
          />
        )}
      </svg>

      {faIcon && (
        <div className="fa-icon-inside-leaflet-icon-holder">{faIcon}</div>
      )}
    </>
  );
  if (selectedIconValue === 'ring') {
    renderContent = (
      <>
        <svg
          x="0px"
          y="0px"
          viewBox="0 0 330 562"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse
            cx={155}
            cy={400}
            rx={150}
            ry={150}
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
              cy={400}
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
            <text
              x={150}
              y={450}
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
            <image
              x={95}
              y={335}
              width={140}
              height={140}
              xlinkHref={image}
              opacity={imageOpacity}
            />
          )}
        </svg>

        {faIcon && (
          <div className="fa-icon-inside-leaflet-icon-holder">{faIcon}</div>
        )}
      </>
    );
  } else if (selectedIconValue === 'rectangle') {
    renderContent = (
      <>
        <svg
          x="0px"
          y="0px"
          viewBox="0 0 310 562"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x={30}
            y={280}
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
              y={300}
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
              y={450}
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
              x={95}
              y={335}
              width={120}
              height={120}
              xlinkHref={image}
              opacity={imageOpacity}
            />
          )}
        </svg>

        {faIcon && (
          <div className="fa-icon-inside-leaflet-icon-holder">{faIcon}</div>
        )}
      </>
    );
  }
  return renderContent;
}
