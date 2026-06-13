import type { JSX, ReactNode } from 'react';
import type { GalleryColorizeBy, GalleryListOrder } from '../model/actions.js';

type Err = { err: unknown };

export type GalleryMessages = {
  sendGalleryEmails: string;
  stats: {
    leaderboard: string;
    country: string;
    perUserPerCountry: string;
    perUser: string;
    more: string;
    less: string;
    user: string;
    photos: string;
    numberOfPhotos: string;
    timePeriod: string;
    allTime: string;
    last3months: string;
    last30days: string;
  };
  legend: string;
  recentTags: string;
  filter: string;
  showPhotosFrom: string;
  showLayer: string;
  upload: string;
  f: Record<GalleryListOrder, string>;
  colorizeBy: string;
  showDirection: string;
  showLegend: string;
  c: Record<GalleryColorizeBy | 'disable', string>;
  viewer: {
    title: string;
    comments: string;
    newComment: string;
    addComment: string;
    yourRating: string;
    showOnTheMap: string;
    openInNewWindow: string;
    uploaded: ({
      username,
      createdAt,
    }: {
      username: ReactNode;
      createdAt: ReactNode;
    }) => JSX.Element;
    captured: (takenAt: JSX.Element) => JSX.Element;
    deletePrompt: (title: string | null | undefined) => JSX.Element;
    deleteTitle: string;
    modify: string;
    premiumOnly: string;
    noComments: string;
  };
  editForm: {
    name: string;
    description: string;
    azimuth: string;
    takenAt: {
      datetime: string;
      date: string;
      time: string;
    };
    location: string;
    tags: string;
    setLocation: string;
  };
  uploadModal: {
    title: string;
    uploading: (n: number) => string;
    upload: string;
    rules: string;
    success: string;
    showPreview: string;
    loadPreview: string;
    premium: string;
  };
  locationPicking: {
    title: string;
  };
  deletingError: (props: Err) => string;
  tagsFetchingError: (props: Err) => string;
  pictureFetchingError: (props: Err) => string;
  picturesFetchingError: (props: Err) => string;
  savingError: (props: Err) => string;
  commentAddingError: (props: Err) => string;
  ratingError: (props: Err) => string;
  missingPositionError: string;
  invalidPositionError: string;
  invalidTakenAt: string;
  filterModal: {
    title: string;
    tag: string;
    createdAt: string;
    takenAt: string;
    author: string;
    rating: string;
    noTags: string;
    pano: string;
    premium: string;
  };
  noPicturesFound: string;
  linkToWww: string;
  linkToImage: string;
  allMyPhotos: {
    title: string;
    premium: string;
    free: string;
    confirmPremium: string;
    confirmFree: string;
  };
};
