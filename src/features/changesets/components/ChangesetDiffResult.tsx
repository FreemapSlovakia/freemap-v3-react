import { selectingModeSelector } from '@app/store/selectors.js';
import { useMap } from '@features/map/hooks/useMap.js';
import { HALO_OPACITY, HALO_WIDTH, SELECTION_COLOR } from '@shared/halo.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { FEATURES_LAYER } from '@shared/mapLibrary/mapIndex.js';
import { canvas } from 'leaflet';
import { type ReactElement, useEffect, useState } from 'react';
import { CircleMarker, Pane, Polyline } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { changesetElementSelect } from '../model/changesetDetail.js';
import {
  currentVersion,
  DIFF_COLORS,
  type DiffElement,
  elementKey,
  hasMoved,
  isIndirect,
  isTagged,
} from '../model/changesetDiff.js';
import { selectedDiffElementSelector } from '../model/selectors.js';

const OLD_COLOR = '#707070';

const MAP_BRIGHTNESS = 0.6;

// Its own pane, as leaflet.css makes canvases in the overlay pane
// click-through; under that pane, or the canvas would take every SVG path's
// clicks. The halo pane under it rings the selected element.
const PANE = 'fm-changeset-diff';

const HALO = 'fm-changeset-diff-halo';

export default function ChangesetDiffResult(): ReactElement | null {
  const diff = useAppSelector((state) => state.changesets.inspected?.diff);

  const opacity = useAppSelector(
    (state) => state.map.layerSetups[FEATURES_LAYER]?.opacity ?? 1,
  );

  const map = useMap();

  const hasDiff = Boolean(diff);

  // Pane's `style` is applied only when the pane is created, with the diff.
  useEffect(() => {
    const pane = hasDiff ? map?.getPane(PANE) : undefined;

    if (pane) {
      pane.style.opacity = String(opacity);
    }
  }, [map, opacity, hasDiff]);

  // Every map layer, presets and vector maps included, renders into
  // `tilePane`: dimmed whole, the changes stand out over any stack of them.
  useEffect(() => {
    const pane = hasDiff ? map?.getPane('tilePane') : undefined;

    if (!pane) {
      return;
    }

    pane.style.filter = `brightness(${MAP_BRIGHTNESS})`;

    return () => {
      pane.style.filter = '';
    };
  }, [map, hasDiff]);

  // Not while a map-click tool takes the clicks. In `pathOptions`, as its
  // `setStyle` is what carries a change of it to a path already drawn.
  const interactive = useAppSelector(selectingModeSelector);

  const dispatch = useDispatch();

  // A changeset can touch thousands of elements, too many for SVG paths.
  const [renderer] = useState(() =>
    canvas({ pane: PANE, padding: 0.5, tolerance: 6 }),
  );

  // The first path adds the renderer to the map, and no path removes it.
  useEffect(() => () => void renderer.remove(), [renderer]);

  if (!diff) {
    return null;
  }

  const ways = diff.filter((element) => element.type === 'way');

  // Untagged vertices of a created way add nothing to the way drawn green.
  const nodes = diff.filter(
    (element) =>
      element.type === 'node' &&
      (element.action !== 'create' || isTagged(element)),
  );

  const common = (element: DiffElement) => ({
    renderer,
    bubblingMouseEvents: false,
    eventHandlers: {
      click() {
        dispatch(changesetElementSelect(element));
      },
    },
  });

  // Where a modified element was, under where it is now.
  const moved = [...ways, ...nodes].filter(hasMoved);

  return (
    <>
      <SelectedHalo />

      <Pane name={PANE} style={{ zIndex: 397 }}>
        {moved.map((element) =>
          element.type === 'way' ? (
            <Polyline
              key={`old-${elementKey(element)}`}
              positions={element.old!.coords}
              pathOptions={{
                color: OLD_COLOR,
                weight: 3,
                dashArray: '4 6',
                interactive,
              }}
              {...common(element)}
            />
          ) : (
            <CircleMarker
              key={`old-${elementKey(element)}`}
              center={element.old!.coords[0]}
              radius={isTagged(element) ? 5 : 2}
              pathOptions={{
                color: OLD_COLOR,
                weight: 1.5,
                fillOpacity: 0.5,
                interactive,
              }}
              {...common(element)}
            />
          ),
        )}

        {ways.map((element) => {
          const version = currentVersion(element);

          return (
            version && (
              <Polyline
                key={elementKey(element)}
                positions={version.coords}
                pathOptions={{
                  color: DIFF_COLORS[element.action],
                  weight:
                    element.action === 'modify' && isIndirect(element) ? 3 : 4,
                  dashArray: element.action === 'delete' ? '6 6' : undefined,
                  interactive,
                }}
                {...common(element)}
              />
            )
          );
        })}

        {nodes.map((element) => {
          const position = currentVersion(element)?.coords[0];

          return (
            position && (
              <CircleMarker
                key={elementKey(element)}
                center={position}
                radius={isTagged(element) ? 6 : 3}
                pathOptions={{
                  color: '#fff',
                  weight: 1.5,
                  fillColor: DIFF_COLORS[element.action],
                  fillOpacity: 1,
                  interactive,
                }}
                {...common(element)}
              />
            )
          );
        })}
      </Pane>
    </>
  );
}

/**
 * The selected element's ring, apart from the paths: a selection re-renders
 * this alone, not the thousands of paths a changeset may hold.
 */
function SelectedHalo(): ReactElement {
  const element = useAppSelector(selectedDiffElementSelector);

  const coords = element && currentVersion(element)?.coords;

  return (
    <Pane name={HALO} style={{ zIndex: 396, opacity: HALO_OPACITY }}>
      {coords &&
        coords.length > 0 &&
        (element?.type === 'way' ? (
          <Polyline
            interactive={false}
            positions={coords}
            pathOptions={{ color: SELECTION_COLOR, weight: 4 + HALO_WIDTH }}
          />
        ) : (
          <CircleMarker
            interactive={false}
            center={coords[0]}
            radius={6 + HALO_WIDTH / 2}
            pathOptions={{
              stroke: false,
              fillColor: SELECTION_COLOR,
              fillOpacity: 1,
            }}
          />
        ))}
    </Pane>
  );
}
