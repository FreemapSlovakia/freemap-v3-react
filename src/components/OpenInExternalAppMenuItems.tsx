import bbox from '@turf/bbox';
import buffer from '@turf/buffer';
import { point } from '@turf/helpers';
import axios from 'axios';
import { loadFb } from 'fm3/fbLoader';
import { useMessages } from 'fm3/l10nInjector';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { LatLon } from 'fm3/types/common';
import { CRS } from 'leaflet';
import popupCentered from 'popup-centered';
import qs, { StringifiableRecord } from 'query-string';
import { ReactElement, useCallback } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
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
  onSelect?: (where: string) => void;
}

export function OpenInExternalAppDropdownItems({
  lat,
  lon,
  zoom,
  mapType,

  expertMode,
  includePoint,
  pointTitle,
  pointDescription,
  url,
  onSelect,
}: Props): ReactElement {
  const m = useMessages();

  const handleDropdownItemSelect = useCallback(
    (where: string | null) => {
      if (onSelect && where !== null) {
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
          const params: StringifiableRecord = {
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
              url: url || window.location,
            })
            .catch((error: unknown) => {
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
          <Dropdown.Item eventKey="window" onSelect={handleDropdownItemSelect}>
            <FontAwesomeIcon icon="window-maximize" /> {m?.external.window}
          </Dropdown.Item>
          {hasShare && (
            <Dropdown.Item eventKey="url" onSelect={handleDropdownItemSelect}>
              <FontAwesomeIcon icon="link" /> {m?.external.url}
            </Dropdown.Item>
          )}
          {(navigator as any).canShare && (
            <Dropdown.Item eventKey="image" onSelect={handleDropdownItemSelect}>
              <FontAwesomeIcon icon="share-alt" /> {m?.external.image}
            </Dropdown.Item>
          )}
          <Dropdown.Divider />
        </>
      )}
      {!url && hasClipboard && (
        <Dropdown.Item eventKey="copy" onSelect={handleDropdownItemSelect}>
          <FontAwesomeIcon icon="clipboard" /> {m?.general.copyUrl}
        </Dropdown.Item>
      )}
      {!url && hasShare && (
        <Dropdown.Item eventKey="url" onSelect={handleDropdownItemSelect}>
          <FontAwesomeIcon icon="link" /> {m?.external.url}
        </Dropdown.Item>
      )}
      {!url && (hasClipboard || hasShare) && <Dropdown.Divider />}
      <Dropdown.Item eventKey="facebook" onSelect={handleDropdownItemSelect}>
        <FontAwesomeIcon icon="facebook-official" /> Facebook
      </Dropdown.Item>
      <Dropdown.Item eventKey="twitter" onSelect={handleDropdownItemSelect}>
        <FontAwesomeIcon icon="twitter" /> Twitter
      </Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item eventKey="osm.org" onSelect={handleDropdownItemSelect}>
        {m?.external.osm}
      </Dropdown.Item>
      <Dropdown.Item eventKey="mapy.cz" onSelect={handleDropdownItemSelect}>
        {m?.external.mapy_cz}
      </Dropdown.Item>
      <Dropdown.Item eventKey="google" onSelect={handleDropdownItemSelect}>
        {m?.external.googleMaps}
      </Dropdown.Item>
      <Dropdown.Item eventKey="mapillary" onSelect={handleDropdownItemSelect}>
        Mapillary
      </Dropdown.Item>
      <Dropdown.Item
        eventKey="openstreetcam"
        onSelect={handleDropdownItemSelect}
      >
        OpenStreetCam
      </Dropdown.Item>
      <Dropdown.Item eventKey="oma.sk" onSelect={handleDropdownItemSelect}>
        {m?.external.oma} (SK)
      </Dropdown.Item>
      <Dropdown.Item eventKey="hiking.sk" onSelect={handleDropdownItemSelect}>
        {m?.external.hiking_sk} (SK)
      </Dropdown.Item>{' '}
      <Dropdown.Item eventKey="zbgis" onSelect={handleDropdownItemSelect}>
        {m?.external.zbgis} (SK)
      </Dropdown.Item>
      <Dropdown.Divider />
      {expertMode && (
        <Dropdown.Item eventKey="josm" onSelect={handleDropdownItemSelect}>
          {m?.external.josm}
        </Dropdown.Item>
      )}
      <Dropdown.Item eventKey="osm.org/id" onSelect={handleDropdownItemSelect}>
        {m?.external.id}
      </Dropdown.Item>
    </>
  );
}
