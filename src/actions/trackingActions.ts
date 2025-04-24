import { createAction } from '@reduxjs/toolkit';
import {
  AccessToken,
  AccessTokenBase,
  Device,
  EditedDevice,
  TrackedDevice,
} from '../types/trackingTypes.js';

export const trackingActions = {
  setTrackedDevices: createAction<TrackedDevice[]>(
    'TRACKING_SET_TRACKED_DEVICES',
  ),

  modifyTrackedDevice: createAction<string | null | undefined>(
    'TRACKING_MODIFY_TRACKED_DEVICE',
  ),

  deleteTrackedDevice: createAction<string>('TRACKING_DELETE_TRACKED_DEVICE'),

  saveTrackedDevice: createAction<TrackedDevice>(
    'TRACKING_SAVE_TRACKED_DEVICE',
  ),

  setDevices: createAction<Device[]>('TRACKING_SET_DEVICES'),

  modifyDevice: createAction<number | undefined | null>(
    'TRACKING_MODIFY_DEVICE',
  ),

  deleteDevice: createAction<number>('TRACKING_DELETE_DEVICE'),

  saveDevice: createAction<EditedDevice>('TRACKING_SAVE_DEVICE'),

  loadDevices: createAction('TRACKING_LOAD_DEVICES'),

  setAccessTokens: createAction<AccessToken[]>('TRACKING_SET_ACCESS_TOKENS'),

  modifyAccessToken: createAction<number | null | undefined>(
    'TRACKING_MODIFY_ACCESS_TOKEN',
  ),

  deleteAccessToken: createAction<number>('TRACKING_DELETE_ACCESS_TOKEN'),

  saveAccessToken: createAction<AccessTokenBase>('TRACKING_SAVE_ACCESS_TOKEN'),

  loadAccessTokens: createAction('TRACKING_LOAD_ACCESS_TOKENS'),

  showAccessTokens: createAction<number | undefined>(
    'TRACKING_SHOW_ACCESS_TOKENS',
  ),

  setShowPoints: createAction<boolean>('TRACKING_SET_SHOW_POINTS'),

  setShowLine: createAction<boolean>('TRACKING_SET_SHOW_LINE'),

  delete: createAction<{ token: string | number }>('TRACKING_DELETE'),
};
