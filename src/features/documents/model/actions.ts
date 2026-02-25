import { createAction } from '@reduxjs/toolkit';

export const documentShow = createAction<string | null>('DOCUMENT_SHOW');
