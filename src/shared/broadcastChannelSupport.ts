let supported: boolean | undefined;

/**
 * Whether `BroadcastChannel` can be used in this context. It is absent in some
 * embedded/in-app browsers and throws in insecure contexts. The popup OAuth
 * login and purchase flows relay their callback through it, so they can't
 * complete without it — callers should warn the user instead of opening a
 * popup that can never report back. The result is cached after the first probe.
 */
export function isBroadcastChannelSupported(): boolean {
  if (supported === undefined) {
    try {
      new BroadcastChannel('freemap-support-check').close();

      supported = true;
    } catch {
      supported = false;
    }
  }

  return supported;
}
