import { useCallback } from 'react';
import { useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { selectFeature } from '../actions/mainActions.js';
import { useAppSelector } from '../hooks/reduxSelectHook.js';

export function SelectionTool(): null {
  const dispatch = useDispatch();

  const selectionActive = useAppSelector((state) => !!state.main.selection);

  useMapEvent(
    'click',
    useCallback(() => {
      if (!window.preventMapClick && selectionActive) {
        dispatch(selectFeature(null));
      }
    }, [dispatch, selectionActive]),
  );

  return null;
}
