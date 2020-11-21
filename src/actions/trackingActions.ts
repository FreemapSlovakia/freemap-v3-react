import { createAction } from 'typesafe-actions';
import {
  TrackedDevice,
  Device,
  AccessToken,
  EditedDevice,
  AccessTokenBase,
} from 'fm3/types/trackingTypes';

export const trackingActions = {
  setTrackedDevices: createAction('TRACKING_SET_TRACKED_DEVICES')<
    TrackedDevice[]
  >(),

  modifyTrackedDevice: createAction('TRACKING_MODIFY_TRACKED_DEVICE')<
    string | number | null | undefined
  >(),

  deleteTrackedDevice: createAction('TRACKING_DELETE_TRACKED_DEVICE')<
    string | number
  >(),

  saveTrackedDevice: createAction(
    'TRACKING_SAVE_TRACKED_DEVICE',
  )<TrackedDevice>(),

  setDevices: createAction('TRACKING_SET_DEVICES')<Device[]>(),

  modifyDevice: createAction('TRACKING_MODIFY_DEVICE')<
    number | undefined | null
  >(),

  deleteDevice: createAction('TRACKING_DELETE_DEVICE')<number>(),

  saveDevice: createAction('TRACKING_SAVE_DEVICE')<EditedDevice>(),

  loadDevices: createAction('TRACKING_LOAD_DEVICES')(),

  setAccessTokens: createAction('TRACKING_SET_ACCESS_TOKENS')<AccessToken[]>(),

  modifyAccessToken: createAction('TRACKING_MODIFY_ACCESS_TOKEN')<
    number | null | undefined
  >(),

  deleteAccessToken: createAction('TRACKING_DELETE_ACCESS_TOKEN')<number>(),

  saveAccessToken: createAction(
    'TRACKING_SAVE_ACCESS_TOKEN',
  )<AccessTokenBase>(),

  loadAccessTokens: createAction('TRACKING_LOAD_ACCESS_TOKENS')(),

  showAccessTokens: createAction('TRACKING_SHOW_ACCESS_TOKENS')<
    number | null | undefined
  >(),

  view: createAction('TRACKING_VIEW')<number>(),

  setShowPoints: createAction('TRACKING_SET_SHOW_POINTS')<boolean>(),

  setShowLine: createAction('TRACKING_SET_SHOW_LINE')<boolean>(),
};
