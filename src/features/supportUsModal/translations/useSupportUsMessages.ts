import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import { SupportUsMessages } from './SupportUsMessages.js';

const factory = (language: string) =>
  import(
    /* webpackExclude: /\.template\./ */
    /* webpackChunkName: "support-translation-[request]" */
    `./${language}.tsx`
  );

export function useSupportUsMessages(): SupportUsMessages | undefined {
  return useLocalMessages<SupportUsMessages>(factory);
}
