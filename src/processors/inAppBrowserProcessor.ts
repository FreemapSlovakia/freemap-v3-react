import { inAppBrowserLeave, init } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { type ToastAction, toastsAdd } from '@features/toasts/model/actions.js';
import { copyToClipboard } from '@shared/clipboardUtils.js';
import { trackMatomo } from '@shared/trackMatomo.js';

// Apps with a browser of their own that hand `intent://` links to Android.
// A plain WebView is left out: it may be an app's own shell, and may fail both
// an `intent://` link and the clipboard.
const KNOWN_APP =
  /FBAN|FBAV|FB_IAB|Instagram|\bLine\/|MicroMessenger|LinkedInApp|Snapchat|musical_ly|BytedanceWebview/;

function escape(): 'app' | 'safari' | 'copy' | null {
  const ua = navigator.userAgent;

  if (window.fmEmbedded || !KNOWN_APP.test(ua)) {
    return null;
  }

  if (/Android/.test(ua)) {
    return 'app';
  }

  const ios = /(?:iPhone|iPad|iPod).* OS (\d+)_/.exec(ua);

  // `x-safari-https:` exists from iOS 17.
  return !ios ? null : Number(ios[1]) >= 17 ? 'safari' : 'copy';
}

export const inAppBrowserProcessor: Processor = {
  actionCreator: [init, inAppBrowserLeave],
  handle({ action, dispatch }) {
    if (inAppBrowserLeave.match(action)) {
      trackMatomo(['trackEvent', 'InAppBrowser', 'leave', action.payload]);

      const { host, pathname, search, hash } = window.location;

      const rest = host + pathname + search + hash;

      // Synchronous in the click, so the navigation keeps its user activation.
      if (action.payload === 'app') {
        // No package: an installed Freemap takes it, else the default browser.
        window.location.href = `intent://${rest}#Intent;scheme=https;end`;
      } else if (action.payload === 'safari') {
        window.location.href = `x-safari-https://${rest}`;
      } else {
        copyToClipboard(dispatch, window.location.href);
      }

      return;
    }

    const how = escape();

    if (!how) {
      return;
    }

    const actions: ToastAction[] = [
      {
        nameKey: 'general.copyLink',
        action: inAppBrowserLeave('copy'),
        variant: 'secondary',
      },
    ];

    if (how !== 'copy') {
      actions.unshift({
        nameKey: how === 'app' ? 'general.openInApp' : 'general.openInSafari',
        action: inAppBrowserLeave(how),
        variant: 'primary',
      });
    }

    dispatch(
      toastsAdd({
        id: 'inAppBrowser',
        messageKey: 'general.inAppBrowser',
        style: 'info',
        actions,
      }),
    );
  },
};
