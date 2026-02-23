import { TypedUseSelectorHook, useSelector } from 'react-redux';
import type { RootState } from '../../app/store/store.js';

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
