import { UnknownAction } from '@reduxjs/toolkit';

export type ActionCreatorMatchable = {
  match: (action: UnknownAction) => boolean;
};

export interface CancelItem {
  cancelActions: ActionCreatorMatchable[];
  cancel: (reason?: string) => void;
}

export const cancelRegister = new Set<CancelItem>();
