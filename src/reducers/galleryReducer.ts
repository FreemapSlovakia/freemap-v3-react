import { toDatetimeLocal } from 'fm3/dateUtils';
import { createReducer } from 'typesafe-actions';
import { RootAction } from 'fm3/actions';
import { clearMap } from 'fm3/actions/mainActions';
import {
  gallerySetImageIds,
  galleryClear,
  gallerySetImage,
  galleryRequestImage,
  galleryAddItem,
  galleryRemoveItem,
  gallerySetItem,
  gallerySetItemError,
  gallerySetPickingPosition,
  galleryConfirmPickedPosition,
  gallerySetItemForPositionPicking,
  galleryUpload,
  gallerySetTags,
  gallerySetUsers,
  gallerySetLayerDirty,
  gallerySetComment,
  galleryShowFilter,
  galleryHideFilter,
  gallerySetFilter,
  galleryShowUploadModal,
  galleryHideUploadModal,
  galleryEditPicture,
  gallerySetEditModel,
  galleryShowOnTheMap,
  galleryCancelShowOnTheMap,
  galleryToggleShowPreview,
  GalleryFilter,
  Picture,
  GalleryTag,
  GalleryUser,
  GalleryItem,
  gallerySavePicture,
} from 'fm3/actions/galleryActions';
import { LatLon } from 'fm3/types/common';
import { PictureModel } from 'fm3/components/gallery/GalleryEditForm';
import { parseCoordinates } from 'fm3/coordinatesParser';
import { latLonToString } from 'fm3/geoutils';
import { l10nSetLanguage } from 'fm3/actions/l10nActions';

export interface GalleryState {
  imageIds: number[] | null;
  activeImageId: number | null;
  image: Picture | null;
  showUploadModal: boolean;
  items: GalleryItem[];
  pickingPositionForId: number | null;
  pickingPosition: LatLon | null;
  showPreview: boolean;
  uploadingId: number | null;
  tags: GalleryTag[];
  users: GalleryUser[];
  dirtySeq: number;
  comment: string;
  showFilter: boolean;
  filter: GalleryFilter;
  editModel: PictureModel | null;
  showPosition: boolean;
  language: string;
  saveErrors: string[];
}

const initialState: GalleryState = {
  imageIds: null,
  activeImageId: null,
  image: null,

  showUploadModal: false,
  items: [],
  pickingPositionForId: null,
  pickingPosition: null,
  showPreview: true,

  uploadingId: null,

  tags: [],
  users: [],

  dirtySeq: 0,
  comment: '',
  showFilter: false,
  filter: {
    tag: undefined,
    userId: undefined,
    takenAtFrom: undefined,
    takenAtTo: undefined,
    createdAtFrom: undefined,
    createdAtTo: undefined,
    ratingFrom: undefined,
    ratingTo: undefined,
  },

  editModel: null,
  saveErrors: [],
  showPosition: false,
  language: 'en-US', // TODO this is hack so that setLanguage will change it in any case on load (eg. to 'en')
};

export const galleryReducer = createReducer<GalleryState, RootAction>(
  initialState,
)
  .handleAction(clearMap, state => ({
    ...initialState,
    dirtySeq: state.dirtySeq,
  }))
  .handleAction(gallerySetImageIds, (state, action) => ({
    ...state,
    imageIds: action.payload,
  }))
  .handleAction(galleryClear, state => ({
    ...state,
    imageIds: null,
    image: null,
    activeImageId: null,
    editModel: null,
  }))
  .handleAction(gallerySetImage, (state, action) => ({
    ...state,
    image: action.payload,
    editModel: null,
  }))
  .handleAction(galleryRequestImage, (state, action) => ({
    ...state,
    activeImageId: action.payload,
    comment: '',
    editModel: null,
  }))
  .handleAction(galleryAddItem, (state, action) => ({
    ...state,
    items: [...state.items, action.payload],
  }))
  .handleAction(galleryRemoveItem, (state, action) => ({
    ...state,
    items: state.items.filter(({ id }) => action.payload !== id),
  }))
  .handleAction(gallerySetItem, (state, action) => ({
    ...state,
    items: state.items.map(item =>
      item.id === action.payload.id ? { ...item, ...action.payload } : item,
    ),
  }))
  .handleAction(gallerySetItemError, (state, action) => ({
    ...state,
    items: state.items.map(item =>
      item.id === action.payload.id
        ? { ...item, errors: [action.payload.error] }
        : item,
    ),
  }))
  .handleAction(gallerySetPickingPosition, (state, action) => ({
    ...state,
    pickingPosition: action.payload,
  }))
  .handleAction(galleryConfirmPickedPosition, state => {
    const s = {
      ...state,
      pickingPositionForId: null,
      pickingPosition: null,
    };

    if (state.pickingPositionForId === -1) {
      if (!state.editModel) {
        throw new Error('editModel is null');
      }
      s.editModel = {
        ...state.editModel,
        dirtyPosition: state.pickingPosition
          ? latLonToString(state.pickingPosition, state.language)
          : state.editModel.dirtyPosition, // TODO language
      };
    } else {
      s.items = state.items.map(item =>
        item.id === state.pickingPositionForId
          ? {
              ...item,
              position: state.pickingPosition,
              dirtyPosition: state.pickingPosition
                ? latLonToString(state.pickingPosition, state.language)
                : '',
            }
          : item,
      );
    }
    return s;
  })
  .handleAction(gallerySetItemForPositionPicking, (state, action) => {
    let x: GalleryItem | undefined;
    return {
      ...state,
      pickingPositionForId: action.payload,
      pickingPosition:
        action.payload === -1
          ? state.editModel
            ? safeParseCoordinates(state.editModel.dirtyPosition)
            : null
          : typeof action.payload === 'number'
          ? (x = state.items.find(({ id }) => id === action.payload))
            ? safeParseCoordinates(x.dirtyPosition)
            : null
          : null,
    };
  })
  .handleAction(galleryUpload, state => {
    const items =
      state.uploadingId === null
        ? state.items.map(item => ({ ...item, errors: getErrors(item) }))
        : state.items;

    const next = items.find(item => !item.errors || item.errors.length === 0);

    return {
      ...state,
      items,
      uploadingId: next ? next.id : null,
    };
  })
  .handleAction(gallerySetTags, (state, action) => ({
    ...state,
    tags: action.payload,
  }))
  .handleAction(gallerySetUsers, (state, action) => ({
    ...state,
    users: action.payload,
  }))
  .handleAction(gallerySetLayerDirty, state => ({
    ...state,
    dirtySeq: state.dirtySeq + 1,
  }))
  .handleAction(gallerySetComment, (state, action) => ({
    ...state,
    comment: action.payload,
  }))
  .handleAction(galleryShowFilter, state => ({
    ...state,
    showFilter: true,
  }))
  .handleAction(galleryHideFilter, state => ({
    ...state,
    showFilter: false,
  }))
  .handleAction(gallerySetFilter, (state, action) => ({
    ...state,
    filter: action.payload,
    showFilter: false,
  }))
  .handleAction(galleryShowUploadModal, state => ({
    ...state,
    showUploadModal: true,
  }))
  .handleAction(galleryHideUploadModal, state => ({
    ...state,
    showUploadModal: false,
    items: [],
    pickingPositionForId: null,
  }))
  .handleAction(galleryEditPicture, state => {
    const position = state.image
      ? { lat: state.image.lat, lon: state.image.lon }
      : null;

    return {
      ...state,
      editModel: state.editModel
        ? null
        : {
            title: state.image ? state.image.title : '',
            description: state.image ? state.image.description : '',
            takenAt: !state.image
              ? ''
              : state.image.takenAt
              ? toDatetimeLocal(state.image.takenAt)
              : '',
            tags: state.image ? [...state.image.tags] : [],
            position,
            dirtyPosition: position
              ? latLonToString(position, state.language)
              : '',
          },
    };
  })
  .handleAction(gallerySetEditModel, (state, action) => ({
    ...state,
    editModel: action.payload,
  }))
  .handleAction(galleryShowOnTheMap, state => ({
    ...state,
    showPosition: true,
  }))
  .handleAction(galleryCancelShowOnTheMap, state => ({
    ...state,
    showPosition: false,
  }))
  .handleAction(galleryToggleShowPreview, state => ({
    ...state,
    showPreview: !state.showPreview,
  }))
  .handleAction(l10nSetLanguage, (state, action) => ({
    ...state,
    language: action.payload,
  }))
  .handleAction(gallerySavePicture, state => ({
    ...state,
    saveErrors: state.editModel ? getErrors(state.editModel) : [],
  }));

function getErrors(item: GalleryItem | PictureModel) {
  const errors: string[] = [];

  if (!item.dirtyPosition) {
    errors.push('gallery.missingPositionError');
  } else {
    try {
      parseCoordinates(item.dirtyPosition);
    } catch (err) {
      errors.push('gallery.invalidPositionError');
    }
  }

  if (
    (item.takenAt instanceof Date && Number.isNaN(item.takenAt.getTime())) ||
    (item.takenAt &&
      typeof item.takenAt === 'string' &&
      Number.isNaN(new Date(item.takenAt).getTime()))
  ) {
    errors.push('gallery.invalidTakenAt');
  }

  return errors;
}

function safeParseCoordinates(coords) {
  try {
    return parseCoordinates(coords);
  } catch (err) {
    return null;
  }
}
