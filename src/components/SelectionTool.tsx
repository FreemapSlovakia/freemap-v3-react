import { selectFeature } from 'fm3/actions/mainActions';
import { useCallback } from 'react';
import { useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';

export function SelectionTool(): null {
  const dispatch = useDispatch();

  useMapEvent(
    'click',
    useCallback(() => {
      if (!window.preventMapClick) {
        dispatch(selectFeature(null));
      }
    }, [dispatch]),
  );
  return null;
}
