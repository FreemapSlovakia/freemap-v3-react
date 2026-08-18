import { mapSetEsriAttribution } from '@features/map/model/actions.js';
import toastsClasses from '@features/toasts/components/Toasts.module.css';
import { toastsAdd, toastsRemove } from '@features/toasts/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import z from 'zod';
import { askingCookieConsentSelector } from '../store/selectors.js';

const EsriWorldImageryAttributionSchema = z.object({
  contributors: z.array(
    z.object({
      attribution: z.string(),
      coverageAreas: z.array(
        z.object({
          zoomMax: z.number().optional(),
          zoomMin: z.number().optional(),
          score: z.number(),
          bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
        }),
      ),
    }),
  ),
});

type EsriWorldImageryAttribution = z.infer<
  typeof EsriWorldImageryAttributionSchema
>;

function isIntersecting(
  caBbox: number[],
  mapBounds: [number, number, number, number],
): boolean {
  return !(
    caBbox[3] < mapBounds[0] ||
    caBbox[2] < mapBounds[1] ||
    caBbox[1] > mapBounds[2] ||
    caBbox[0] > mapBounds[3]
  );
}

export function useAttributionInfo() {
  const [nonce, setNonce] = useState(0);

  const dispatch = useDispatch();

  const layers = useAppSelector((state) => state.map.layers);

  const licenceShownForRef = useRef([
    new Set<string>(),
    new Set<string>(),
  ] as const);

  const prevNonceRef = useRef(0);

  const showingAttribution = useAppSelector(
    (state) => 'attribution' in state.toasts.toasts,
  );

  const askingCookieConsent = useAppSelector(askingCookieConsentSelector);

  // hide attribution on mouse down
  useEffect(() => {
    if (!showingAttribution) {
      return;
    }

    const handlePointerDown = (e: MouseEvent) => {
      if (e.target instanceof Element) {
        let el: Element | null = e.target;

        while (el) {
          if (
            el instanceof HTMLElement &&
            el.classList.contains(toastsClasses.toasts)
          ) {
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

  const attributionHeldRef = useRef(false);

  // The consent prompt shares the toast stack, so the attribution is raised
  // without a timeout while it is unanswered — no timeout also means the toast
  // ignores the pointer, which would otherwise arm one on leaving it. Answering
  // the prompt re-raises the toast, now with its five seconds.
  const showAttributionToast = useCallback(
    (timeout: number | undefined) => {
      attributionHeldRef.current = timeout === undefined;

      dispatch(
        toastsAdd({
          id: 'attribution',
          messageKey: 'general.attribution',
          style: 'info',
          timeout,
        }),
      );
    },
    [dispatch],
  );

  useEffect(() => {
    if (
      showingAttribution &&
      !askingCookieConsent &&
      attributionHeldRef.current
    ) {
      showAttributionToast(5000);
    }
  }, [askingCookieConsent, showingAttribution, showAttributionToast]);

  const [esriAttributions, setEsriAttributions] = useState<
    EsriWorldImageryAttribution | undefined
  >(undefined);

  const esriAttribution = useAppSelector((state) => state.map.esriAttribution);

  const bounds = useAppSelector((state) => state.map.bounds);

  // The zoom the coverage areas below are matched against: the tile zoom, plus
  // the level a high-density display adds by fetching one deeper (as the tile
  // layers' own `zoomOffset` does).
  const zoom = useAppSelector(
    (state) =>
      Math.round(state.map.zoom) +
      ((window.devicePixelRatio || 1) > 1.4 ? 1 : 0),
  );

  useEffect(() => {
    if (!layers.includes('S') || !esriAttributions || !bounds) {
      if (esriAttribution.length > 0) {
        dispatch(mapSetEsriAttribution([]));
      }

      return;
    }

    const a = esriAttributions.contributors.filter((c) =>
      c.coverageAreas.some(
        (ca) =>
          (ca.zoomMin === undefined || ca.zoomMin <= zoom) &&
          (ca.zoomMax === undefined || ca.zoomMax >= zoom) &&
          isIntersecting(ca.bbox, bounds),
      ),
    );

    const attributions = a.map((a) => a.attribution);

    if (attributions.join('\n') !== esriAttribution.join('\n')) {
      dispatch(mapSetEsriAttribution(attributions));
    }
  }, [esriAttributions, esriAttribution, zoom, bounds, dispatch, layers]);

  const ea = useRef(false);

  useEffect(() => {
    async function fetchAttributions() {
      if (ea.current || !layers.includes('S')) {
        return;
      }

      ea.current = true;

      try {
        const res = await fetch(
          'https://static.arcgis.com/attribution/World_Imagery',
        );

        if (res.ok) {
          setEsriAttributions(
            EsriWorldImageryAttributionSchema.parse(await res.json()),
          );
        }
      } catch {
        // A network failure or malformed response leaves attributions absent;
        // reset the guard so a later render can retry the fetch.
        ea.current = false;
      }
    }

    fetchAttributions();
  }, [layers]);

  useEffect(() => {
    if (window.isRobot) {
      return;
    }

    const [mapLayers, esriAttributions] = licenceShownForRef.current;

    if (
      layers.every((o) => mapLayers.has(o)) &&
      esriAttribution.every((a) => esriAttributions.has(a)) &&
      prevNonceRef.current === nonce
    ) {
      return;
    }

    prevNonceRef.current = nonce;

    for (const o of layers) {
      mapLayers.add(o);
    }

    for (const a of esriAttribution) {
      esriAttributions.add(a);
    }

    showAttributionToast(askingCookieConsent ? undefined : 5000);
  }, [
    layers,
    nonce,
    esriAttribution,
    askingCookieConsent,
    showAttributionToast,
  ]);

  return useCallback(() => {
    setNonce((n) => n + 1);
  }, []);
}
