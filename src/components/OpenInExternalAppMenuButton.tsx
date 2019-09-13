import axios from 'axios';
import React, { useCallback, useRef, useState } from 'react';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Button from 'react-bootstrap/lib/Button';
import Popover from 'react-bootstrap/lib/Popover';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { Overlay } from 'react-bootstrap';
import { LatLon } from 'fm3/types/common';
import { CRS } from 'leaflet';
import qs from 'query-string';

interface Props extends LatLon {
  lat: number;
  lon: number;
  zoom: number;
  mapType: string;
  expertMode: boolean;
  placement?: string;
  includePoint?: boolean;
  pointTitle?: string;
  url?: string;
  t: Translator;
  children: JSX.Element | JSX.Element[];
}

const OpenInExternalAppMenuButton: React.FC<Props> = ({
  lat,
  lon,
  zoom,
  mapType,
  t,
  expertMode,
  placement,
  includePoint,
  pointTitle,
  url,
  children,
}) => {
  const buttonRef = useRef<Button>();
  const [show, setShow] = useState(false);

  const handleMenuItemClick = useCallback(
    ({ target: { dataset } }) => {
      setShow(false);

      switch (dataset.where) {
        case 'window':
          window.open(url);
          break;
        case 'osm.org':
          if (includePoint) {
            window.open(
              `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=${zoom}`,
            );
          } else {
            window.open(
              `https://www.openstreetmap.org/#map=${
                zoom > 19 ? 19 : zoom
              }/${lat.toFixed(5)}/${lon.toFixed(5)}`,
            );
          }
          break;
        case 'osm.org/id':
          window.open(
            `https://www.openstreetmap.org/edit?editor=id#map=${zoom}/${lat.toFixed(
              5,
            )}/${lon.toFixed(5)}`,
          );
          break;
        case 'josm': {
          const leaflet = getMapLeafletElement();
          if (leaflet) {
            const bounds = leaflet.getBounds();
            const opts = {
              params: {
                left: bounds.getWest(),
                right: bounds.getEast(),
                top: bounds.getNorth(),
                bottom: bounds.getSouth(),
              },
            };
            [['http', 8111], ['https', 8112]].forEach(([proto, port]) => {
              axios
                .get(`${proto}://localhost:${port}/load_and_zoom`, opts)
                .then(() => {
                  if (includePoint) {
                    axios.get(`${proto}://localhost:${port}/add_node`, {
                      params: {
                        lat,
                        lon,
                        addtags: `name=${pointTitle}`,
                      },
                    });
                  }
                });
            });
          }
          break;
        }
        case 'hiking.sk': {
          const point = CRS.EPSG3857.project({ lat, lng: lon });
          const params: any = {
            zoom: zoom > 15 ? 15 : zoom,
            lon: point.x,
            lat: point.y,
            layers: '00B00FFFTTFTTTTFFFFFFTTT',
          };

          if (includePoint) {
            params.x = lon;
            params.y = lat;
          }

          window.open(`https://mapy.hiking.sk/?${qs.stringify(params)}`);
          break;
        }
        case 'google':
          if (includePoint) {
            window.open(
              `http://maps.google.com/maps?&z=${zoom}&q=loc:${lat}+${lon}`,
            );
          } else {
            window.open(`https://www.google.com/maps/@${lat},${lon},${zoom}z`);
          }
          break;
        case 'mapy.cz/ophoto':
          window.open(
            `https://mapy.cz/zakladni?x=${lon}&y=${lat}&z=${
              zoom > 19 ? 19 : zoom
            }&base=ophoto${
              includePoint ? `&source=coor&id=${lon}%2C${lat}` : ''
            }`,
          );
          break;
        case 'oma.sk':
          window.open(
            `http://redirect.oma.sk/?lat=${lat}&lon=${lon}&zoom=${zoom}&mapa=${mapType}`,
          );
          break;
        case 'mojamapa.sk':
          window.open(`https://mojamapa.sk?op=C-${lon}-${lat}`);
          break;
        case 'routing-debug':
          window.open(
            `https://routing.epsilon.sk/debug.php?lat=${lat}&lon=${lon}&zoom=${zoom}&profil=${{
              C: 'bike',
              K: 'ski',
              A: 'car',
            }[mapType] || 'foot'}`,
          );
          break;
        default:
          break;
      }
    },
    [lat, lon, mapType, zoom, url],
  );

  const handleButtonClick = useCallback(() => {
    setShow(true);
  }, [setShow]);

  const handleHide = useCallback(() => {
    setShow(false);
  }, [setShow]);

  const getTarget = useCallback(() => buttonRef.current, [buttonRef.current]);

  const Ovl = Overlay as any; // because trigger is missing

  return (
    <>
      <Button
        ref={buttonRef as React.MutableRefObject<Button>}
        onClick={handleButtonClick}
        title={t('external.openInExternal')}
      >
        {children}
      </Button>
      <Ovl
        rootClose
        placement={placement || 'bottom'}
        trigger="focus"
        show={show}
        onHide={handleHide}
        target={getTarget}
      >
        <Popover id="popover-trigger-click-root-close" className="fm-menu">
          <ul>
            {url && (
              <>
                <MenuItem data-where="window" onClick={handleMenuItemClick}>
                  {t('external.window')}
                </MenuItem>
                <MenuItem divider />
              </>
            )}
            <MenuItem data-where="osm.org" onClick={handleMenuItemClick}>
              {t('external.osm')}
            </MenuItem>
            <MenuItem data-where="oma.sk" onClick={handleMenuItemClick}>
              {t('external.oma')}
            </MenuItem>
            <MenuItem data-where="google" onClick={handleMenuItemClick}>
              {t('external.googleMaps')}
            </MenuItem>
            <MenuItem data-where="hiking.sk" onClick={handleMenuItemClick}>
              {t('external.hiking_sk')}
            </MenuItem>
            <MenuItem data-where="mapy.cz/ophoto" onClick={handleMenuItemClick}>
              {t('external.mapy_cz-aerial')}
            </MenuItem>
            <MenuItem data-where="mojamapa.sk" onClick={handleMenuItemClick}>
              {t('external.mojamapa_sk')}
            </MenuItem>
            <MenuItem divider />
            {expertMode && (
              <MenuItem data-where="josm" onClick={handleMenuItemClick}>
                {t('external.josm')}
              </MenuItem>
            )}
            <MenuItem data-where="osm.org/id" onClick={handleMenuItemClick}>
              {t('external.id')}
            </MenuItem>
            {expertMode && <MenuItem divider />}
            {expertMode && (
              <MenuItem
                data-where="routing-debug"
                onClick={handleMenuItemClick}
              >
                {t('external.routing-debug')}
              </MenuItem>
            )}
          </ul>
        </Popover>
      </Ovl>
    </>
  );
};

export default withTranslator(OpenInExternalAppMenuButton);
