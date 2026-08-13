import { useRecorderNotices } from '../hooks/useRecorderNotices.js';

/**
 * Renders nothing; exists so the notices outlive the menu. The failure the
 * loud syncs exist to announce — a recorder that stopped answering mid-ride —
 * nulls the status, which is exactly what unmounts the menu, so a hook living
 * there would be destroyed in the same commit that should raise the toast.
 * `Main` mounts this for as long as there is anything to announce.
 */
export default function GpsRecorderNotices(): null {
  useRecorderNotices();

  return null;
}
