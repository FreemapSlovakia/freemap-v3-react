import axios from 'axios';
import React, { useCallback } from 'react';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { LatLon } from 'fm3/types/common';
import { CRS } from 'leaflet';
import qs from 'query-string';
import buffer from '@turf/buffer';
import bbox from '@turf/bbox';
import { point } from '@turf/helpers';
import { loadFb } from 'fm3/fbLoader';
import popupCentered from 'popup-centered';
import { FontAwesomeIcon } from './FontAwesomeIcon';

interface Props extends LatLon {
  lat: number;
  lon: number;
  zoom: number;
  mapType: string;
  expertMode: boolean;
  placement?: string;
  includePoint?: boolean;
  pointTitle?: string;
  pointDescription?: string;
  url?: string;
  t: Translator;
  onSelect?: (where: string) => void;
}

const OpenInExternalAppMenuItemsInt: React.FC<Props> = ({
  lat,
  lon,
  zoom,
  mapType,
  t,
  expertMode,
  includePoint,
  pointTitle,
  pointDescription,
  url,
  onSelect,
}) => {
  const handleMenuItemSelect = useCallback(
    (where: any) => {
      if (onSelect) {
        onSelect(where);
      }

      switch (where) {
        case 'window':
          window.open(url);
          break;
        case 'facebook': {
          const { href } = location;

          loadFb().then(() => {
            FB.ui({
              method: 'share',
              hashtag: '#openstreetmap',
              href,
            });
          });
          break;
        }
        case 'twitter':
          popupCentered(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(
              location.href,
            )}`,
            'twitter',
            575,
            280,
          );
          break;
        case 'copy':
          navigator.clipboard.writeText(location.href);
          // TODO success toast
          break;
        case 'osm.org':
          if (includePoint) {
            window.open(
              `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=${zoom}`,
            );
          } else {
            window.open(
              `https://www.openstreetmap.org/#map=${Math.min(
                zoom,
                19,
              )}/${lat.toFixed(5)}/${lon.toFixed(5)}`,
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
            let left: number;
            let right: number;
            let top: number;
            let bottom: number;

            if (includePoint) {
              [left, bottom, right, top] = bbox(
                buffer(point([lon, lat]), 100, { units: 'meters', steps: 10 }),
              );
            } else {
              const bounds = leaflet.getBounds();
              left = bounds.getWest();
              right = bounds.getEast();
              top = bounds.getNorth();
              bottom = bounds.getSouth();
            }

            axios
              .get(`http://localhost:8111/load_and_zoom`, {
                params: { left, right, top, bottom },
              })
              .then(() => {
                if (includePoint) {
                  axios.get(`http://localhost:8111/add_node`, {
                    params: {
                      lat,
                      lon,
                      addtags: `name=${pointTitle}`,
                    },
                  });
                }
              });
          }
          break;
        }
        case 'zbgis':
          window.open(
            `https://zbgis.skgeodesy.sk/mkzbgis?bm=zbgis&z=${zoom}&c=${lon},${lat}`,
          );
          break;
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
        case 'mapy.cz':
          window.open(
            `https://mapy.cz/zakladni?x=${lon}&y=${lat}&z=${
              zoom > 19 ? 19 : zoom
            }${includePoint ? `&source=coor&id=${lon}%2C${lat}` : ''}`,
          );
          break;
        case 'oma.sk':
          window.open(
            `http://redirect.oma.sk/?lat=${lat}&lon=${lon}&zoom=${zoom}&mapa=${mapType}`,
          );
          break;
        case 'openstreetcam':
          window.open(`https://openstreetcam.org/map/@${lat},${lon},${zoom}z`);
          break;
        case 'mapillary':
          window.open(
            `https://www.mapillary.com/app/?lat=${lat}&lng=${lon}&z=${zoom}`,
          );
          break;
        case 'url':
          (navigator as any)
            .share({
              title: pointTitle,
              text: pointDescription,
              url,
            })
            .catch((error) => {
              console.error(error);
            }); // TODO toast
          break;
        case 'image':
          {
            const nav = navigator as any;

            const share = async () => {
              if (!url) {
                throw new Error('missong url');
              }

              const response = await fetch(url);

              const filesArray = [
                new File([await response.blob()], 'picture.jpg', {
                  type: 'image/jpeg',
                }),
              ];

              if (!nav.canShare({ files: filesArray })) {
                throw new Error("can't share");
              }

              await nav.share({
                files: filesArray,
                title: pointTitle,
                text: pointDescription,
              });
            };

            share().catch((err) => {
              console.error(err); // TODO toast
            });
          }
          break;
        default:
          break;
      }
    },
    [
      lat,
      lon,
      mapType,
      zoom,
      url,
      includePoint,
      pointTitle,
      onSelect,
      pointDescription,
    ],
  );

  const hasShare = 'share' in navigator;
  const hasClipboard = navigator.clipboard?.writeText;

  return (
    <>
      {url && (
        <>
          <MenuItem eventKey="window" onSelect={handleMenuItemSelect}>
            <FontAwesomeIcon icon="window-maximize" /> {t('external.window')}
          </MenuItem>
          {hasShare && (
            <MenuItem eventKey="url" onSelect={handleMenuItemSelect}>
              <FontAwesomeIcon icon="link" /> {t('external.url')}
            </MenuItem>
          )}
          {(navigator as any).canShare && (
            <MenuItem eventKey="image" onSelect={handleMenuItemSelect}>
              <FontAwesomeIcon icon="share-alt" /> {t('external.image')}
            </MenuItem>
          )}
          <MenuItem divider />
        </>
      )}
      {!url && hasClipboard && (
        <MenuItem eventKey="copy" onSelect={handleMenuItemSelect}>
          <FontAwesomeIcon icon="clipboard" /> {t('external.copy')}
        </MenuItem>
      )}
      {!url && hasShare && (
        <MenuItem eventKey="url" onSelect={handleMenuItemSelect}>
          <FontAwesomeIcon icon="link" /> {t('external.url')}
        </MenuItem>
      )}
      {!url && (hasClipboard || hasShare) && <MenuItem divider />}
      <MenuItem eventKey="facebook" onSelect={handleMenuItemSelect}>
        <FontAwesomeIcon icon="facebook-official" /> Facebook
      </MenuItem>
      <MenuItem eventKey="twitter" onSelect={handleMenuItemSelect}>
        <FontAwesomeIcon icon="twitter" /> Twitter
      </MenuItem>
      <MenuItem divider />
      <MenuItem eventKey="osm.org" onSelect={handleMenuItemSelect}>
        {t('external.osm')}
      </MenuItem>
      <MenuItem eventKey="mapy.cz" onSelect={handleMenuItemSelect}>
        {t('external.mapy_cz')}
      </MenuItem>
      <MenuItem eventKey="google" onSelect={handleMenuItemSelect}>
        {t('external.googleMaps')}
      </MenuItem>
      <MenuItem eventKey="mapillary" onSelect={handleMenuItemSelect}>
        Mapillary
      </MenuItem>
      <MenuItem eventKey="openstreetcam" onSelect={handleMenuItemSelect}>
        OpenStreetCam
      </MenuItem>
      <MenuItem eventKey="oma.sk" onSelect={handleMenuItemSelect}>
        {t('external.oma')} (SK)
      </MenuItem>
      <MenuItem eventKey="hiking.sk" onSelect={handleMenuItemSelect}>
        {t('external.hiking_sk')} (SK)
      </MenuItem>{' '}
      <MenuItem eventKey="zbgis" onSelect={handleMenuItemSelect}>
        {t('external.zbgis')} (SK)
      </MenuItem>
      <MenuItem divider />
      {expertMode && (
        <MenuItem eventKey="josm" onSelect={handleMenuItemSelect}>
          {t('external.josm')}
        </MenuItem>
      )}
      <MenuItem eventKey="osm.org/id" onSelect={handleMenuItemSelect}>
        {t('external.id')}
      </MenuItem>
    </>
  );
};

export const OpenInExternalAppMenuItems = withTranslator(
  OpenInExternalAppMenuItemsInt,
);
