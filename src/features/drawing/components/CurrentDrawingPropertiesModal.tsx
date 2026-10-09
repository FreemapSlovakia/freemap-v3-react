import { setActiveModal } from '@app/store/actions.js';
import { drawingLineChangeProperties } from '@features/drawing/model/actions/drawingLineActions.js';
import { drawingPointChangeProperties } from '@features/drawing/model/actions/drawingPointActions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import {
  type FeatureProperties,
  FeaturePropertiesModal,
} from '@shared/components/FeaturePropertiesModal.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { polygon } from '@turf/helpers';
import { type ReactElement, useCallback, useEffect } from 'react';
import { shallowEqual, useDispatch } from 'react-redux';
import {
  lineChange,
  lineProperties,
  pointChange,
  pointProperties,
} from '../featureProperties.js';

type Props = { show: boolean };

export default function CurrentDrawingPropertiesModal({
  show,
}: Props): ReactElement | null {
  const selection = useAppSelector((state) => state.main.selection);

  const point = useAppSelector(
    (state) =>
      selection?.type === 'draw-points' && selection.id !== undefined
        ? state.drawingPoints.points[selection.id]
        : undefined,
    shallowEqual,
  );

  const line = useAppSelector(
    (state) =>
      selection?.type === 'draw-line-poly' && selection.id !== undefined
        ? state.drawingLines.lines[selection.id]
        : undefined,
    shallowEqual,
  );

  const polyPoints = line?.points;

  const dispatch = useDispatch();

  // Developer commands typed into the label, which take the polygon as their
  // area of interest. `true` says the submit was one, and saves nothing.
  const runDeveloperCommand = useCallback(
    (editedLabel: string) => {
      if (
        polyPoints &&
        polyPoints.length >= 3 &&
        editedLabel === 'cry me a river'
      ) {
        const pixelSize = window.prompt('Pixel size?');

        if (pixelSize == null) {
          return true;
        }

        const threshold = window.prompt('Stream threshold?', '20000');

        if (!threshold) {
          return true;
        }

        const minLen = window.prompt('Minimum stream length?', '50');

        if (!minLen) {
          return true;
        }

        const simplifyTolerance = window.prompt('Simplify tolerance?', '1.5');

        if (!simplifyTolerance) {
          return true;
        }

        const inJosm = window.confirm('Open in JSOM?');

        const toOsm =
          inJosm || window.confirm('Write as OSM? (otherwise ad GeoJSON)');

        const q = new URLSearchParams({
          threshold,
          'min-len': minLen,
          'simplify-tolerance': simplifyTolerance,
          mask: JSON.stringify(
            polygon([
              [...polyPoints, polyPoints[0]].map((p) => [p.lon, p.lat]),
            ]),
          ),
        });

        if (pixelSize) {
          q.append('pixel-size', pixelSize);
        }

        if (toOsm) {
          q.append('to-osm', '1');
        }

        if (inJosm) {
          fetch(
            'http://localhost:8111/import?new_layer=true&url=' +
              encodeURIComponent(
                `https://streamfinder.freemap.sk?${q.toString()}`,
              ),
          )
            .then((res) => {
              if (!res.ok) {
                throw new Error(
                  `Error response from localhost:8111: ${res.status}`,
                );
              }
            })
            .catch((err) => {
              dispatch?.(
                toastsAdd({
                  messageKey: 'general.operationError',
                  messageParams: { err },
                  style: 'danger',
                }),
              );
            });
        } else {
          const aElem = document.createElement('a');

          aElem.href = `https://streamfinder.freemap.sk?${q.toString()}`;

          aElem.target = '_blank';

          aElem.click();
        }

        return true;
      }

      if (polyPoints && editedLabel === 'run forest run') {
        const classifications = window.prompt('Classifications?', '4,5');

        if (!classifications) {
          return true;
        }

        const inJosm = window.confirm('Open in JSOM?');

        const toOsm =
          inJosm || window.confirm('Write as OSM? (otherwise ad GeoJSON)');

        const q = new URLSearchParams({
          classifications,
          mask: JSON.stringify(
            polygon([
              [...polyPoints, polyPoints[0]].map((p) => [p.lon, p.lat]),
            ]),
          ),
          'to-osm': toOsm ? '1' : '',
        });

        if (inJosm) {
          fetch(
            'http://localhost:8111/import?new_layer=true&url=' +
              encodeURIComponent(`https://forester.freemap.sk?${q.toString()}`),
          )
            .then((res) => {
              if (!res.ok) {
                throw new Error(
                  `Error response from localhost:8111: ${res.status}`,
                );
              }
            })
            .catch((err) => {
              dispatch?.(
                toastsAdd({
                  messageKey: 'general.operationError',
                  messageParams: { err },
                  style: 'danger',
                }),
              );
            });
        } else {
          const aElem = document.createElement('a');

          aElem.href = `https://forester.freemap.sk?${q.toString()}`;

          aElem.target = '_blank';

          aElem.click();
        }

        return true;
      }

      return false;
    },
    [dispatch, polyPoints],
  );

  const handleSave = (values: FeatureProperties): boolean | undefined => {
    if (runDeveloperCommand(values.label)) {
      return true;
    }

    if (
      selection?.type !== 'draw-line-poly' &&
      selection?.type !== 'draw-points'
    ) {
      return;
    }

    dispatch(
      selection.type === 'draw-line-poly'
        ? drawingLineChangeProperties(lineChange(selection.id, values))
        : drawingPointChangeProperties(pointChange(selection.id, values)),
    );
  };

  const gone = !line && !point;

  // Its feature gone, as after a Back that rebuilt the drawing: no modal to stay open.
  useEffect(() => {
    if (show && gone) {
      dispatch(setActiveModal(null));
    }
  }, [show, gone, dispatch]);

  if (gone) {
    return null;
  }

  return (
    <FeaturePropertiesModal
      show={show}
      kind={line ? 'line-poly' : 'point'}
      initial={line ? lineProperties(line) : pointProperties(point!)}
      closable={(polyPoints?.length ?? 0) >= 3}
      onSave={handleSave}
    />
  );
}
