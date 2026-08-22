import type { RootState } from '@app/store/store.js';
import type { LeafletMouseEvent } from 'leaflet';
import { useCallback } from 'react';
import { useMapEvent } from 'react-leaflet';
import { useDispatch, useStore } from 'react-redux';
import { placeToposcopeCenter } from '../centerPoint.js';
import { toposcopeSetPickingCenter } from '../model/actions.js';

/**
 * Takes the click that says where the dial stands. The centre is an ordinary
 * drawn point — created here when there is none, moved when there is — so
 * labelling, styling and deleting it happen in the drawing tool afterwards.
 */
export default function ToposcopeCenterPicking(): null {
  const dispatch = useDispatch();

  // Read as the click comes rather than subscribed to: this component draws
  // nothing, so nothing feeding the placement should re-render it.
  const store = useStore<RootState>();

  useMapEvent(
    'click',
    useCallback(
      ({ latlng }: LeafletMouseEvent) => {
        dispatch(
          placeToposcopeCenter(store.getState(), {
            lat: latlng.lat,
            lon: latlng.lng,
          }),
        );

        dispatch(toposcopeSetPickingCenter(false));
      },
      [dispatch, store],
    ),
  );

  return null;
}
