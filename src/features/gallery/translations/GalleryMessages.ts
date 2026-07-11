import type { JSX, ReactNode } from 'react';
import type { GalleryLicense } from '../licenses.js';
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
  // Disclaimer: ordering/leaderboard cover own photos only, not Wikimedia ones.
  excludesWikimedia: string;
  // Colorize: Wikimedia photos are shown neutral — we lack this per-photo datum.
  noWikimediaData: string;
  showLayer: string;
  upload: string;
  f: Record<GalleryListOrder, string>;
  colorizeBy: string;
  // The "no colorize" dropdown entry (own vs. Wikimedia is shown by shape).
  noColorize: string;
  showDirection: string;
  c: Record<GalleryColorizeBy, string>;
  // Legend swatch labels for the categorical colorize modes.
  legendCategory: {
    mine: string;
    notMine: string;
    premium: string;
    free: string;
  };
  viewer: {
    title: string;
    imageUnavailable: string;
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
  license: {
    label: string;
    chooseForAll: string;
    changeNote: string;
    since: string;
    names: Record<GalleryLicense, string>;
    descriptions: Record<GalleryLicense, string>;
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
    source: string;
    allSources: string;
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
    confirmLicense: (license: string) => string;
  };
};
