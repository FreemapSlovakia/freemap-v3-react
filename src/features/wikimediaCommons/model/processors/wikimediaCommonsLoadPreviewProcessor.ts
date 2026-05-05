import { httpRequest } from '@app/httpRequest.js';
import { setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { objectToURLSearchParams } from '@shared/stringUtils.js';
import { assert } from 'typia';
import {
  wikimediaCommonsLoadPreview,
  wikimediaCommonsSetPreview,
} from '../actions.js';
import { ExtMetaValue, pickLang, stripHtml } from './extMetaUtils.js';

interface PreviewResponse {
  query?: {
    pages?: {
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
    }[];
  };
}

export const wikimediaCommonsLoadPreviewProcessor: Processor<
  typeof wikimediaCommonsLoadPreview
> = {
  actionCreator: wikimediaCommonsLoadPreview,
  errorKey: 'general.loadError',
  handle: async ({ getState, dispatch, action }) => {
    const pageId = action.payload;

    const targetWidth = Math.min(
      1280,
      Math.max(480, Math.round(window.innerWidth * 0.8)),
    );

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
          pageids: String(pageId),
          prop: 'coordinates|imageinfo',
          coprimary: 'all',
          colimit: 'max',
          iiprop: 'url|extmetadata',
          iiurlwidth: String(targetWidth),
          iiextmetadatafilter:
            'ImageDescription|Artist|LicenseShortName|LicenseUrl|DateTime',
          iiextmetadatamultilang: '1',
          iiextmetadatalanguage: language,
        }),
      expectedStatus: 200,
      cancelActions: [setActiveModal, wikimediaCommonsSetPreview],
    });

    const data = assert<PreviewResponse>(await res.json());

    const page = data.query?.pages?.[0];

    const ii = page?.imageinfo?.[0];

    const coord = page?.coordinates?.[0];

    if (!page || !ii?.thumburl || !ii.descriptionurl || !coord) {
      dispatch(wikimediaCommonsSetPreview(null));

      return;
    }

    const meta = ii.extmetadata;

    const thumbUrl = ii.thumburl.replace(/\?.*$/, '');

    dispatch(
      wikimediaCommonsSetPreview({
        pageId: page.pageid,
        title: page.title,
        lat: coord.lat,
        lon: coord.lon,
        thumbUrl,
        thumbWidth: ii.thumbwidth ?? targetWidth,
        thumbHeight: ii.thumbheight ?? targetWidth,
        descriptionUrl: ii.descriptionurl,
        description: stripHtml(
          pickLang(meta?.ImageDescription?.value, language),
        ),
        artist: stripHtml(pickLang(meta?.Artist?.value, language)),
        license: stripHtml(pickLang(meta?.LicenseShortName?.value, language)),
        licenseUrl: pickLang(meta?.LicenseUrl?.value, language),
        dateTime: stripHtml(pickLang(meta?.DateTime?.value, language)),
        largeThumbUrl: thumbUrl,
        largeThumbWidth: ii.thumbwidth ?? targetWidth,
        largeThumbHeight: ii.thumbheight ?? targetWidth,
      }),
    );
  },
};
