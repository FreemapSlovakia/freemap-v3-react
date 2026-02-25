import { createAction } from '@reduxjs/toolkit';

export const startProgress = createAction<string | number>('START_PROGRESS');

export const stopProgress = createAction<string | number>('STOP_PROGRESS');
