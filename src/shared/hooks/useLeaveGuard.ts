import { addLeaveReason } from '@shared/leaveGuard.js';
import { useEffect } from 'react';

/** Asks before the page goes while `active` holds and the caller is mounted. */
export function useLeaveGuard(active: boolean): void {
  useEffect(() => (active ? addLeaveReason(() => true) : undefined), [active]);
}
