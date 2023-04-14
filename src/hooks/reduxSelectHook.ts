import { RootState } from 'fm3/reducers';
import { TypedUseSelectorHook, useSelector } from 'react-redux';

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
