import { mapSetEsriAttribution } from 'fm3/actions/mapActions';
import { toastsAdd, toastsRemove } from 'fm3/actions/toastsActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useMap } from 'fm3/hooks/useMap';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { assert } from 'typia';
import { BBox } from 'geojson';

type EsriWorldImageryAttribution = {
  contributors: {
    attribution: string;
    coverageAreas: {
      zoomMax: number;
      zoomMin: number;
      score: number;
      bbox: BBox;
    }[];
  }[];
};

function isIntersecting(caBbox: number[], mapBounds: L.LatLngBounds): boolean {
  return !(
    caBbox[3] < mapBounds.getWest() ||
    caBbox[2] < mapBounds.getSouth() ||
    caBbox[1] > mapBounds.getEast() ||
    caBbox[0] > mapBounds.getNorth()
  );
}

export function useAttributionInfo() {
  const [nonce, setNonce] = useState(0);

  const dispatch = useDispatch();

  const mapType = useAppSelector((state) => state.map.mapType);

  const overlays = useAppSelector((state) => state.map.overlays);

  const licenceShownForRef = useRef([
    new Set<string>(),
    new Set<string>(),
    new Set<string>(),
  ] as const);

  const prevNonceRef = useRef(0);

  const showingAttribution = useAppSelector((state) =>
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

  const map = useMap();

  const [esriAttributions, setEsriAttributions] = useState<
    EsriWorldImageryAttribution | undefined
  >(undefined);

  const esriAttribution = useAppSelector((state) => state.map.esriAttribution);

  const [movedCount, setMovedCount] = useState(0);

  useEffect(() => {
    if (mapType !== 'S' || !esriAttributions || !map) {
      if (esriAttribution.length > 0) {
        dispatch(mapSetEsriAttribution([]));
      }

      return;
    }

    const bounds = map.getBounds();

    const isHdpi = (window.devicePixelRatio || 1) > 1.4;

    const zoom = map.getZoom() + (isHdpi ? 1 : 0);

    const a = esriAttributions.contributors.filter((c) =>
      c.coverageAreas.some(
        (ca) =>
          ca.zoomMin <= zoom &&
          ca.zoomMax >= zoom &&
          isIntersecting(ca.bbox, bounds),
      ),
    );

    const attributions = a.map((a) => a.attribution);

    if (attributions.join('\n') !== esriAttribution.join('\n')) {
      dispatch(mapSetEsriAttribution(attributions));
    }
  }, [esriAttributions, esriAttribution, movedCount, mapType, map, dispatch]);

  useEffect(() => {
    function handleMoveZoom() {
      setMovedCount((c) => c + 1);
    }

    if (map) {
      map.on('moveend', handleMoveZoom);

      map.on('zoomend', handleMoveZoom);
    }

    return map
      ? () => {
          map.off('moveend', handleMoveZoom);

          map.off('zoomend', handleMoveZoom);
        }
      : undefined;
  }, [map]);

  const ea = useRef(false);

  useEffect(() => {
    async function fetchAttributions() {
      if (ea.current || mapType !== 'S') {
        return;
      }

      ea.current = true;

      const res = await fetch(
        'https://static.arcgis.com/attribution/World_Imagery',
      );

      if (res.ok) {
        setEsriAttributions(
          assert<EsriWorldImageryAttribution>(await res.json()),
        );
      }
    }

    fetchAttributions(); // TODO handle error
  }, [mapType]);

  useEffect(() => {
    if (window.isRobot) {
      return;
    }

    const [mapTypes, mapOverlays, esriAttributions] =
      licenceShownForRef.current;

    if (
      mapTypes.has(mapType) &&
      overlays.every((o) => mapOverlays.has(o)) &&
      esriAttribution.every((a) => esriAttributions.has(a)) &&
      prevNonceRef.current === nonce
    ) {
      return;
    }

    prevNonceRef.current = nonce;

    mapTypes.add(mapType);

    for (const o of overlays) {
      mapOverlays.add(o);
    }

    for (const a of esriAttribution) {
      esriAttributions.add(a);
    }

    dispatch(
      toastsAdd({
        id: 'attribution',
        messageKey: 'general.attribution',
        style: 'info',
        timeout: 5000,
      }),
    );
  }, [mapType, overlays, dispatch, nonce, esriAttribution]);

  return useCallback(() => {
    setNonce((n) => n + 1);
  }, []);
}
