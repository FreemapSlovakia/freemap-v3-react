import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import { RoutePlannerMessages } from './RoutePlannerMessages.js';

const factory = (language: string) =>
  import(
    /* webpackExclude: /\.template\./ */
    /* webpackChunkName: "route-planner-translation-[request]" */
    `./${language}.tsx`
  );

export function useRoutePlannerMessages(): RoutePlannerMessages | undefined {
  return useLocalMessages<RoutePlannerMessages>(factory);
}
