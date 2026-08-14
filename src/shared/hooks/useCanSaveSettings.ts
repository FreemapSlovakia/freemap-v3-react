import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';

/**
 * Whether `saveSettings` can go through. A signed-in account keeps its settings
 * — custom maps, layer preferences — on the server, and the copy fetched at the
 * next sign-in overwrites whatever the browser holds, so writing them offline
 * would only look saved. Signed out there is no server side to it and the same
 * settings are the browser's own, so they save offline like anything local.
 */
export function useCanSaveSettings(): boolean {
  const online = useOnline();

  const signedIn = useAppSelector((state) => Boolean(state.auth.user));

  return online || !signedIn;
}
