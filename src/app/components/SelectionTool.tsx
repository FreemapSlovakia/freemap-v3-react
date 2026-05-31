import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { selectFeature } from '../store/actions.js';

export function SelectionTool(): null {
  const dispatch = useDispatch();

  const selectionActive = useAppSelector((state) =>
    Boolean(state.main.selection),
  );

  useMapEvent('click', () => {
    if (!window.preventMapClick && selectionActive) {
      dispatch(selectFeature(null));
    }
  });

  return null;
}
