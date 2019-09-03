import { createStandardAction } from 'typesafe-actions';
import {
  TrackedDevice,
  Device,
  AccessToken,
  EditedDevice,
  AccessTokenBase,
} from 'fm3/types/trackingTypes';

export const trackingActions = {
  setTrackedDevices: createStandardAction('TRACKING_SET_TRACKED_DEVICES')<
    TrackedDevice[]
  >(),

  modifyTrackedDevice: createStandardAction('TRACKING_MODIFY_TRACKED_DEVICE')<
    string | number | null | undefined
  >(),

  deleteTrackedDevice: createStandardAction('TRACKING_DELETE_TRACKED_DEVICE')<
    string | number
  >(),

  saveTrackedDevice: createStandardAction('TRACKING_SAVE_TRACKED_DEVICE')<
    TrackedDevice
  >(),

  setDevices: createStandardAction('TRACKING_SET_DEVICES')<Device[]>(),

  modifyDevice: createStandardAction('TRACKING_MODIFY_DEVICE')<
    number | undefined | null
  >(),

  deleteDevice: createStandardAction('TRACKING_DELETE_DEVICE')<number>(),

  saveDevice: createStandardAction('TRACKING_SAVE_DEVICE')<EditedDevice>(),

  loadDevices: createStandardAction('TRACKING_LOAD_DEVICES')<void>(),

  setAccessTokens: createStandardAction('TRACKING_SET_ACCESS_TOKENS')<
    AccessToken[]
  >(),

  modifyAccessToken: createStandardAction('TRACKING_MODIFY_ACCESS_TOKEN')<
    number | null | undefined
  >(),

  deleteAccessToken: createStandardAction('TRACKING_DELETE_ACCESS_TOKEN')<
    number
  >(),

  saveAccessToken: createStandardAction('TRACKING_SAVE_ACCESS_TOKEN')<
    AccessTokenBase
  >(),

  loadAccessTokens: createStandardAction('TRACKING_LOAD_ACCESS_TOKENS')<void>(),

  showAccessTokens: createStandardAction('TRACKING_SHOW_ACCESS_TOKENS')<
    number | null | undefined
  >(),

  view: createStandardAction('TRACKING_VIEW')<number>(),

  setActive: createStandardAction('TRACKING_SET_ACTIVE')<string | number>(),

  setShowPoints: createStandardAction('TRACKING_SET_SHOW_POINTS')<boolean>(),

  setShowLine: createStandardAction('TRACKING_SET_SHOW_LINE')<boolean>(),
};
