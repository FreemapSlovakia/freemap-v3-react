import { httpRequest } from '@app/httpRequest.js';
import { clearMapFeatures } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapPromise } from '@features/map/hooks/leafletElementHolder.js';
import { mapRefocus, mapToggleLayer } from '@features/map/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { cancelRegister } from '@shared/cancelRegister.js';
import { objectToURLSearchParams } from '@shared/stringUtils.js';
import { assert } from 'typia';
import {
  WikimediaCommonsPhoto,
  wikimediaCommonsSetPhotos,
} from '../actions.js';
import { ExtMetaValue, pickLang, stripHtml } from './extMetaUtils.js';

const MIN_ZOOM = 13;

interface CommonsPage {
  pageid: number;
  title: string;
  coordinates?: { lat: number; lon: number }[];
  imageinfo?: {
    thumburl?: string;
    thumbwidth?: number;
    thumbheight?: number;
    descriptionurl?: string;
    extmetadata?: {
      ImageDescription?: { value?: ExtMetaValue };
      Artist?: { value?: ExtMetaValue };
      LicenseShortName?: { value?: ExtMetaValue };
      LicenseUrl?: { value?: ExtMetaValue };
      DateTime?: { value?: ExtMetaValue };
    };
  }[];
}

interface CommonsResponse {
  query?: {
    pages?: CommonsPage[];
  };
  continue?: Record<string, unknown>;
}

let initial = true;

export const wikimediaCommonsLayerProcessor: Processor = {
  errorKey: 'general.loadError',
  async handle({ getState, dispatch, prevState }) {
    const {
      map: { layers, lat, lon, zoom },
      wikimediaCommons: { photos },
    } = getState();

    const prevMap = prevState.map;

    const ok0 = layers.includes('M');

    const ok = ok0 && zoom >= MIN_ZOOM;

    const prevOk0 = prevMap.layers.includes('M');

    const prevOk = prevOk0 && prevMap.zoom >= MIN_ZOOM;

    if (
      !initial &&
      `${lat},${lon},${ok}` === `${prevMap.lat},${prevMap.lon},${prevOk}`
    ) {
      return;
    }

    initial = false;

    if (!ok) {
      if (prevOk && photos.length) {
        dispatch(wikimediaCommonsSetPhotos([]));
      }

      return;
    }

    try {
      await new Promise<void>((resolve, reject) => {
        const to = window.setTimeout(
          () => {
            cancelRegister.delete(cancelItem);

            resolve();
          },
          prevOk0 === ok0 ? 1000 : 0,
        );

        const cancelItem = {
          cancelActions: [mapRefocus, mapToggleLayer],
          cancel: () => {
            cancelRegister.delete(cancelItem);

            window.clearTimeout(to);

            reject();
          },
        };

        cancelRegister.add(cancelItem);
      });
    } catch {
      return;
    }

    const bb = (await mapPromise).getBounds();

    const { language } = getState().l10n;

    const res = await httpRequest({
      getState,
      method: 'GET',
      url:
        'https://commons.wikimedia.org/w/api.php?' +
        objectToURLSearchParams({
          origin: '*',
          action: 'query',
          format: 'json',
          formatversion: '2',
          generator: 'geosearch',
          ggsnamespace: '6',
          ggsbbox: `${bb.getNorth()}|${bb.getWest()}|${bb.getSouth()}|${bb.getEast()}`,
          ggslimit: 'max',
          ggsprimary: 'all',
          prop: 'coordinates|imageinfo',
          coprimary: 'all',
          colimit: 'max',
          iiprop: 'url|extmetadata',
          iiurlwidth: '120',
          iiextmetadatafilter:
            'ImageDescription|Artist|LicenseShortName|LicenseUrl|DateTime',
          iiextmetadatamultilang: '1',
          iiextmetadatalanguage: language,
        }),
      expectedStatus: 200,
      cancelActions: [mapRefocus, mapToggleLayer],
    });

    const data = assert<CommonsResponse>(await res.json());

    const pages = data.query?.pages;

    if (!pages) {
      dispatch(wikimediaCommonsSetPhotos([]));

      return;
    }

    const out: WikimediaCommonsPhoto[] = [];

    for (const page of pages) {
      const coord = page.coordinates?.[0];

      const ii = page.imageinfo?.[0];

      if (!coord || !ii?.thumburl || !ii.descriptionurl) {
        continue;
      }

      const meta = ii.extmetadata;

      out.push({
        pageId: page.pageid,
        title: page.title,
        lat: coord.lat,
        lon: coord.lon,
        thumbUrl: ii.thumburl.replace(/\?.*$/, ''),
        thumbWidth: ii.thumbwidth ?? 120,
        thumbHeight: ii.thumbheight ?? 120,
        descriptionUrl: ii.descriptionurl,
        description: stripHtml(
          pickLang(meta?.ImageDescription?.value, language),
        ),
        artist: stripHtml(pickLang(meta?.Artist?.value, language)),
        license: stripHtml(pickLang(meta?.LicenseShortName?.value, language)),
        licenseUrl: pickLang(meta?.LicenseUrl?.value, language),
        dateTime: stripHtml(pickLang(meta?.DateTime?.value, language)),
      });
    }

    dispatch(wikimediaCommonsSetPhotos(out));

    if (data.continue) {
      dispatch(
        toastsAdd({
          id: 'wikimediaCommons.moreResults',
          messageKey: 'wikimediaCommons.moreResults',
          style: 'warning',
          cancelType: [
            clearMapFeatures.type,
            mapRefocus.type,
            mapToggleLayer.type,
          ],
        }),
      );
    }
  },
};
