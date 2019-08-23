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
  IGalleryFilter,
  IPicture,
  IGalleryTag,
  IGalleryUser,
  IGalleryItem,
} from 'fm3/actions/galleryActions';
import { LatLon } from 'fm3/types/common';
import { IPictureModel } from 'fm3/components/gallery/GalleryEditForm';
import parseCoordinates from 'fm3/coordinatesParser';
import { latLonToString } from 'fm3/geoutils';
import { l10nSetLanguage } from 'fm3/actions/l10nActions';

export interface IGalleryState {
  imageIds: number[] | null;
  activeImageId: number | null;
  image: IPicture | null;
  showUploadModal: boolean;
  items: IGalleryItem[];
  pickingPositionForId: number | null;
  pickingPosition: LatLon | null;
  showPreview: boolean;
  uploadingId: number | null;
  tags: IGalleryTag[];
  users: IGalleryUser[];
  dirtySeq: number;
  comment: string;
  showFilter: boolean;
  filter: IGalleryFilter;
  editModel: IPictureModel | null;
  showPosition: boolean;
  language: string;
}

const initialState: IGalleryState = {
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
  showPosition: false,
  language: 'en-US', // TODO this is hack so that setLanguage will change it in any case on load (eg. to 'en')
};

export const galleryReducer = createReducer<IGalleryState, RootAction>(
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
      item.id === action.payload.id ? action.payload.item : item,
    ),
  }))
  .handleAction(gallerySetItemError, (state, action) => ({
    ...state,
    items: state.items.map(item =>
      item.id === action.payload.id
        ? { ...item, error: action.payload.error }
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
    let x: IGalleryItem | undefined;
    return {
      ...state,
      pickingPositionForId: action.payload,
      pickingPosition:
        action.payload === -1
          ? state.editModel
            ? parseCoordinates(state.editModel.dirtyPosition)
            : null
          : typeof action.payload === 'number'
          ? (x = state.items.find(({ id }) => id === action.payload))
            ? x.dirtyPosition
              ? parseCoordinates(x.dirtyPosition)
              : null
            : null
          : null,
    };
  })
  .handleAction(galleryUpload, state => {
    const items =
      state.uploadingId === null
        ? state.items.map(item => ({ ...item, error: getError(item) }))
        : state.items;
    const next = items.find(item => !item.error);

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
  }));

function getError(item: IGalleryItem) {
  const errors: string[] = [];

  if (!item.dirtyPosition) {
    // TODO also validate
    errors.push('Chýba pozícia.'); // TODO translate
  }

  if (item.takenAt && Number.isNaN(item.takenAt.getTime())) {
    errors.push('Nevalidný dátum a čas fotenia.'); // TODO translate
  }

  return errors.length ? errors.join('\n') : null;
}
