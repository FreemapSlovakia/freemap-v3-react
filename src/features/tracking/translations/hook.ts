import { useLocalMessages } from '../../l10n/l10nInjector.js';
import { Messages } from './messagesInterface.js';

export function useTrackingMessages() {
  return useLocalMessages<Messages>(
    (language) =>
      import(
        /* webpackExclude: /\.template\./ */
        /* webpackChunkName: "tracking-translation-[request]" */
        `./translations/${language}.tsx`
      ),
  );
}
