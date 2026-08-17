import { createAction } from '@reduxjs/toolkit';
import type { ColorizingMode } from '@shared/colorizers/index.js';
import type {
  AccessToken,
  AccessTokenBase,
  Device,
  EditedDevice,
  TrackedDevice,
} from './types.js';

export const trackingActions = {
  setTrackedDevices: createAction<TrackedDevice[]>(
    'TRACKING_SET_TRACKED_DEVICES',
  ),

  deleteTrackedDevice: createAction<string>('TRACKING_DELETE_TRACKED_DEVICE'),

  saveTrackedDevice: createAction<{
    device: TrackedDevice;
    /** Token of the edited device (so a renamed token replaces the old entry); null when creating. */
    previousToken: string | null;
  }>('TRACKING_SAVE_TRACKED_DEVICE'),

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

  setColorizeBy: createAction<ColorizingMode | null>(
    'TRACKING_SET_COLORIZE_BY',
  ),

  setColorizeLegend: createAction<boolean | undefined>(
    'TRACKING_SET_COLORIZE_LEGEND',
  ),

  delete: createAction<{ token: string | number }>('TRACKING_DELETE'),

  /**
   * Copies what a watched device has travelled so far into the track viewer,
   * where it becomes an ordinary loaded track. The live feed keeps running, so
   * this is a snapshot, not a hand-over. `token` absent copies every watched
   * device.
   */
  copyToDataViewer: createAction<{
    token?: string;
    /** How the copy meets what the viewer already holds. */
    mode: 'replace' | 'append';
  }>('TRACKING_COPY_TO_DATA_VIEWER'),
};
