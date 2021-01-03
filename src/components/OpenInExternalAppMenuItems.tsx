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

function sqr(x) {
  return x*x;
}

function convert(lat,lon, H) {
  var d2r = Math.PI/180;
  var a = 6378137.0;
  var f1 = 298.257223563;
  var dx = -570.69;
  var dy = -85.69;
  var dz = -462.84;
  var wx = 4.99821/3600*Math.PI/180;
  var wy = 1.58676/3600*Math.PI/180;
  var wz = 5.2611/3600*Math.PI/180;
  var m  = -3.543e-6;

  var f = document.forms[0];

  var B = lat*d2r;
  var L = lon*d2r;

  var e2 = 1 - sqr(1-1/f1);
  var rho = a/Math.sqrt(1-e2*sqr(Math.sin(B)));
  var x1 = (rho+H) * Math.cos(B)*Math.cos(L);
  var y1 = (rho+H) * Math.cos(B)*Math.sin(L);
  var z1 = ((1-e2)*rho+H) * Math.sin(B);

  var x2 = dx + (1+m)*(x1 + wz*y1 - wy*z1);
  var y2 = dy + (1+m)*(-wz*x1 + y1 + wx*z1);
  var z2 = dz + (1+m)*(wy*x1 - wx*y1 + z1);

  a = 6377397.15508;
  f1 = 299.152812853;
  var ab = f1/(f1-1);
  var p = Math.sqrt(sqr(x2) + sqr(y2));
  e2 = 1-sqr(1-1/f1);
  var th = Math.atan(z2*ab/p);
  var st = Math.sin(th);
  var ct = Math.cos(th);
  var t = (z2 + e2*ab*a*(st*st*st))/(p - e2*a*(ct*ct*ct));

  B = Math.atan(t);
  H = Math.sqrt(1+t*t) * (p-a/Math.sqrt(1+(1-e2)*t*t));
  L = 2*Math.atan(y2/(p+x2));

  a = 6377397.15508;
  var e = 0.081696831215303;
  var n = 0.97992470462083;
  var rho0 = 12310230.12797036;
  var sinUQ = 0.863499969506341;
  var cosUQ = 0.504348889819882;
  var sinVQ = 0.420215144586493;
  var cosVQ = 0.907424504992097;
  var alpha  = 1.000597498371542;
  var k2 = 1.00685001861538;

  var sinB = Math.sin(B);
  t = (1-e*sinB)/(1+e*sinB);
  t = sqr(1+sinB)/(1-sqr(sinB)) * Math.exp(e*Math.log(t));
  t = k2 * Math.exp(alpha*Math.log(t));

  var sinU = (t-1)/(t+1);
  var cosU = Math.sqrt(1-sinU*sinU);
  var V = alpha*L;
  var sinV = Math.sin(V);
  var cosV = Math.cos(V);
  var cosDV = cosVQ*cosV + sinVQ*sinV;
  var sinDV = sinVQ*cosV - cosVQ*sinV;
  var sinS = sinUQ*sinU + cosUQ*cosU*cosDV;
  var cosS = Math.sqrt(1-sinS*sinS);
  var sinD = sinDV*cosU/cosS;
  var cosD = Math.sqrt(1-sinD*sinD);

  var eps = n*Math.atan(sinD/cosD);
  rho = rho0*Math.exp(-n*Math.log((1+sinS)/cosS));

  var CX = rho*Math.sin(eps);
  var CY = rho*Math.cos(eps);

  return Array(CX, CY);
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
        case 'of1950':{
          const point = convert( lat, lon, 200);
          window.open(`http://mapy.tuzvo.sk/hofm/default.aspx?pcx=-{point[0]toFixed(0)}&pcy=-{point[1]toFixed(0)}&psc=2500`,
          );
          break;
        }
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
