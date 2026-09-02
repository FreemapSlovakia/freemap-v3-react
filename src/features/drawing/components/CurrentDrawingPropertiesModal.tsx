import {
  type DrawingLineType,
  drawingLineChangeProperties,
} from '@features/drawing/model/actions/drawingLineActions.js';
import { drawingPointChangeProperties } from '@features/drawing/model/actions/drawingPointActions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { COLORS } from '@shared/colors.js';
import {
  type FeatureProperties,
  FeaturePropertiesModal,
} from '@shared/components/FeaturePropertiesModal.js';
import { PlaceholderHint } from '@shared/components/PlaceholderHint.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { polygon } from '@turf/helpers';
import { type ReactElement, useCallback } from 'react';
import { shallowEqual, useDispatch } from 'react-redux';
import { PROPERTY_PREFIX } from '../interpolateLabel.js';
import { useDrawingMessages } from '../translations/useDrawingMessages.js';

type Props = { show: boolean };

export default function CurrentDrawingPropertiesModal({
  show,
}: Props): ReactElement {
  const dm = useDrawingMessages();

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
        ? drawingLineChangeProperties({
            index: selection.id,
            properties: {
              label: values.label || undefined,
              color: values.color,
              fillColor: values.fillColor,
              width: values.width,
              type: values.type,
              dashArray: values.dashArray,
              lineCap: values.lineCap,
              lineJoin: values.lineJoin,
              props: values.props,
            },
          })
        : drawingPointChangeProperties({
            index: selection.id,
            properties: {
              label: values.label || undefined,
              color: values.color,
              markerType: values.markerType,
              icon: values.icon || undefined,
              props: values.props,
            },
          }),
    );
  };

  const isLine = selection?.type === 'draw-line-poly';

  const type: DrawingLineType = line?.type ?? 'line';

  const color = (isLine ? line?.color : point?.color) ?? COLORS.normal;

  return (
    <FeaturePropertiesModal
      show={show}
      kind={isLine ? 'line-poly' : 'point'}
      initial={{
        label: (isLine ? line?.label : point?.label) ?? '',
        props: isLine ? line?.props : point?.props,
        color,
        markerType: point?.markerType ?? 'pin',
        icon: point?.icon ?? '',
        type,
        fillColor: line?.fillColor ?? (type === 'polygon' ? color : undefined),
        width: line?.width,
        dashArray: line?.dashArray ?? [],
        lineCap: line?.lineCap ?? 'round',
        lineJoin: line?.lineJoin ?? 'round',
      }}
      closable={(polyPoints?.length ?? 0) >= 3}
      placeholders={{
        hint: (type) => (
          <>
            {dm?.edit.hint}{' '}
            <PlaceholderHint
              text={
                isLine
                  ? type === 'polygon'
                    ? dm?.edit.polygonKeys
                    : dm?.edit.lineKeys
                  : dm?.edit.pointKeys
              }
            />{' '}
            <PlaceholderHint text={dm?.edit.optionalKeys} />
          </>
        ),
        token: (key) => `{${PROPERTY_PREFIX}${key}}`,
      }}
      onSave={handleSave}
    />
  );
}
