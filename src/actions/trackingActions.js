import * as at from 'fm3/actionTypes';

export function trackingSetDevices(devices) {
  return { type: at.TRACKING_SET_DEVICES, payload: devices };
}

export function trackingSetTrackedDevices(devices) {
  return { type: at.TRACKING_SET_TRACKED_DEVICES, payload: devices };
}

export function trackingModifyDevice(id) {
  return { type: at.TRACKING_MODIFY_DEVICE, payload: id };
}

export function trackingDeleteDevice(id) {
  return { type: at.TRACKING_DELETE_DEVICE, payload: id };
}

export function trackingSaveDevice(device) {
  return { type: at.TRACKING_SAVE_DEVICE, payload: device };
}

export function trackingLoadDevices() {
  return { type: at.TRACKING_LOAD_DEVICES };
}
