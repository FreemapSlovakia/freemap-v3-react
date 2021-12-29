import { toastsAdd, toastsRemove } from 'fm3/actions/toastsActions';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export function useAttributionInfo() {
  const [nonce, setNonce] = useState(0);

  const dispatch = useDispatch();

  const mapType = useSelector((state) => state.map.mapType);

  const overlays = useSelector((state) => state.map.overlays);

  const licenceShownForRef = useRef([
    new Set<string>(),
    new Set<string>(),
  ] as const);

  const prevNonceRef = useRef(0);

  const showingAttribution = useSelector((state) =>
    state.toasts.toasts.some((toast) => toast.id === 'attribution'),
  );

  // hide attribution on mouse down
  useEffect(() => {
    if (!showingAttribution) {
      return;
    }

    const handlePointerDown = (e: MouseEvent) => {
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

    document.body.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.body.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [dispatch, showingAttribution]);

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

    prevNonceRef.current = nonce;

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

  return useCallback(() => {
    setNonce((n) => n + 1);
  }, []);
}
