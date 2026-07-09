import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import type { RoutePlannerMessages } from './RoutePlannerMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "route-planner-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useRoutePlannerMessages(): RoutePlannerMessages | undefined {
  return useLocalMessages<RoutePlannerMessages>(factory);
}
