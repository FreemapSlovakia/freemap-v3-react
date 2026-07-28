import storage from 'local-storage-fallback';

/** Remembers the stage-1 opt-in across reloads. */
const FLAG_KEY = 'fm.gpsRecorder.enabled';

/**
 * Chromium on Android, the only combination the integration can work on: the
 * recorder ships as an Android APK, and reaching its loopback API needs
 * Chrome's Local Network Access opt-in.
 *
 * `navigator.userAgentData` exists only in Chromium, so its presence already
 * carries the engine half of the test; `platform` and `mobile` are low-entropy
 * hints and therefore readable synchronously.
 */
function isSupportedPlatform(): boolean {
  const uaData = navigator.userAgentData;

  return uaData?.mobile === true && uaData.platform === 'Android';
}

/**
 * Stage-1 feature flag. `?gps-recorder=1` turns the tool on and is remembered;
 * `?gps-recorder=0` turns it back off. Read from the query string rather than
 * the hash because the hash is owned by the URL processor.
 */
function isFlagged(): boolean {
  const param = new URLSearchParams(window.location.search).get('gps-recorder');

  if (param === null) {
    return storage.getItem(FLAG_KEY) === '1';
  }

  const on = param !== '0' && param !== 'false';

  storage.setItem(FLAG_KEY, on ? '1' : '0');

  return on;
}

/**
 * Whether the GPS recorder tool is offered at all. Evaluated once: neither the
 * platform nor the flag can change within a page lifetime.
 */
export const gpsRecorderAvailable = isFlagged() && isSupportedPlatform();
