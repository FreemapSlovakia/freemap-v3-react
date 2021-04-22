import { selectFeature } from 'fm3/actions/mainActions';
import { useCallback } from 'react';
import { useMapEvent } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';

export function SelectionTool(): null {
  const dispatch = useDispatch();

  const selectionActive = useSelector((state) => !!state.main.selection);

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
