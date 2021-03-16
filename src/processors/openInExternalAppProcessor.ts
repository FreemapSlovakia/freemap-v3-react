import bbox from '@turf/bbox';
import buffer from '@turf/buffer';
import { point } from '@turf/helpers';
import axios from 'axios';
import { openInExternalApp } from 'fm3/actions/mainActions';
import { loadFb } from 'fm3/fbLoader';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { CRS } from 'leaflet';
import popupCentered from 'popup-centered';
import qs, { StringifiableRecord } from 'query-string';

export const openInExternalAppProcessor: Processor<typeof openInExternalApp> = {
  actionCreator: openInExternalApp,
  handle: async ({ action, getState }) => {
    const {
      where,
      lat: lat0,
      lon: lon0,
      zoom: zoom0,
      mapType: mapType0,
      includePoint,
      pointTitle,
      pointDescription,
      url,
    } = action.payload;

    const lat = lat0 ?? getState().map.lat;

    const lon = lon0 ?? getState().map.lon;

    const zoom = zoom0 ?? getState().map.zoom;

    const mapType = mapType0 ?? getState().map.mapType;

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
          params['x'] = lon;
          params['y'] = lat;
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
};
