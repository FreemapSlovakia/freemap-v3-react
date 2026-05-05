import { createAction } from '@reduxjs/toolkit';

export interface WikimediaCommonsPhoto {
  pageId: number;
  title: string;
  lat: number;
  lon: number;
  thumbUrl: string;
  thumbWidth: number;
  thumbHeight: number;
  descriptionUrl: string;
  description?: string;
  artist?: string;
  license?: string;
  licenseUrl?: string;
  dateTime?: string;
}

export interface WikimediaCommonsPreview extends WikimediaCommonsPhoto {
  largeThumbUrl: string;
  largeThumbWidth: number;
  largeThumbHeight: number;
}

export const wikimediaCommonsSetPhotos = createAction<WikimediaCommonsPhoto[]>(
  'WIKIMEDIA_COMMONS_SET_PHOTOS',
);

export const wikimediaCommonsLoadPreview = createAction<number>(
  'WIKIMEDIA_COMMONS_LOAD_PREVIEW',
);

export const wikimediaCommonsSetPreview =
  createAction<WikimediaCommonsPreview | null>('WIKIMEDIA_COMMONS_SET_PREVIEW');
