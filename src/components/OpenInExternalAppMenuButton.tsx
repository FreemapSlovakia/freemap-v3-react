import axios from 'axios';
import React, { useCallback, useRef, useState } from 'react';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Button from 'react-bootstrap/lib/Button';
import Popover from 'react-bootstrap/lib/Popover';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { Overlay } from 'react-bootstrap';
import { LatLon } from 'fm3/types/common';
import { CRS } from 'leaflet';

interface Props extends LatLon {
  lat: number;
  lon: number;
  zoom: number;
  mapType: string;
  expertMode: boolean;
  t: Translator;
}

const OpenInExternalAppMenuButton: React.FC<Props> = ({
  lat,
  lon,
  zoom,
  mapType,
  t,
  expertMode,
}) => {
  const buttonRef = useRef<Button>();
  const [show, setShow] = useState(false);

  const handleMenuItemClick = useCallback(
    ({ target: { dataset } }) => {
      setShow(false);

      switch (dataset.where) {
        case 'osm.org':
          window.open(
            `https://www.openstreetmap.org/#map=${
              zoom > 19 ? 19 : zoom
            }/${lat.toFixed(5)}/${lon.toFixed(5)}`,
          );
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
              axios.get(`${proto}://localhost:${port}/load_and_zoom`, opts);
            });
          }
          break;
        }
        case 'hiking.sk': {
          const point = CRS.EPSG3857.project({ lat, lng: lon });
          window.open(
            `https://mapy.hiking.sk/?zoom=${zoom > 15 ? 15 : zoom}&lon=${
              point.x
            }&lat=${point.y}&layers=00B00FFFTTFTTTTFFFFFFTTT`,
          );
          break;
        }
        case 'google':
          window.open(`https://www.google.sk/maps/@${lat},${lon},${zoom}z`);
          break;
        case 'mapy.cz/ophoto':
          window.open(
            `https://mapy.cz/zakladni?x=${lon}&y=${lat}&z=${
              zoom > 19 ? 19 : zoom
            }&base=ophoto`,
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
    [lat, lon, mapType, zoom],
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
        <FontAwesomeIcon icon="external-link" />
      </Button>
      <Ovl
        rootClose
        placement="bottom"
        trigger="focus"
        show={show}
        onHide={handleHide}
        target={getTarget}
      >
        <Popover id="popover-trigger-click-root-close" className="fm-menu">
          <ul>
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
