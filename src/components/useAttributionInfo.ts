import { toastsAdd, toastsRemove } from 'fm3/actions/toastsActions';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export function useAttributionInfo(nonce: number) {
  const dispatch = useDispatch();

  const mapType = useSelector((state) => state.map.mapType);

  const overlays = useSelector((state) => state.map.overlays);

  const licenceShownForRef = useRef([
    new Set<string>(),
    new Set<string>(),
  ] as const);

  const prevNonceRef = useRef(0);

  // hide attribution on mouse down
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.target instanceof Element) {
        let el: Element | null = e.target;

        while (el) {
          if (el instanceof HTMLElement && el.classList.contains('fm-toasts')) {
            return;
          }

          el = el.parentElement;
        }
      }

      dispatch(toastsRemove('attribution'));
    };

    document.body.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.body.removeEventListener('mousedown', handleMouseDown);
    };
  }, [dispatch]);

  useEffect(() => {
    if (window.isRobot) {
      return;
    }

    const [mapTypes, mapOverlays] = licenceShownForRef.current;

    if (
      mapTypes.has(mapType) &&
      overlays.every((o) => mapOverlays.has(o)) &&
      prevNonceRef.current === nonce
    ) {
      return;
    }

    mapTypes.add(mapType);

    for (const o of overlays) {
      mapOverlays.add(o);
    }

    dispatch(
      toastsAdd({
        id: 'attribution',
        messageKey: 'general.attribution',
        style: 'info',
        timeout: 5000,
      }),
    );
  }, [mapType, overlays, dispatch, nonce]);
}