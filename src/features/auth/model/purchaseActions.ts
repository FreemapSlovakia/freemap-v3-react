import { createAction } from '@reduxjs/toolkit';
import type { Purchase } from './types.js';

export const purchaseOnLogin = createAction<Purchase>('PURCHASE_ON_LOGIN');
