import { ActionCreator } from 'typesafe-actions';

export interface CancelItem {
  cancelActions: ActionCreator<string>[];
  cancel: () => void;
}

export const cancelRegister = new Set<CancelItem>();
