import { selectingModeSelector } from '@app/store/selectors.js';
import {
  FEATURES_PANE_CLASS,
  useOwnPaneOpacity,
} from '@features/map/hooks/featuresPane.js';
import { HALO_OPACITY, HALO_WIDTH, SELECTION_COLOR } from '@shared/halo.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { canvas } from 'leaflet';
import { type ReactElement, useEffect, useState } from 'react';
import { CircleMarker, Pane, Polyline } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import {
  currentVersion,
  DIFF_COLORS,
  type DiffElement,
  elementKey,
  hasMoved,
  isIndirect,
  isTagged,
} from '../model/changesetDiff.js';
import { changesetElementSelect } from '../model/inspectorToast.js';
import { selectedDiffElementSelector } from '../model/selectors.js';

const OLD_COLOR = '#707070';

// Its own pane, as leaflet.css makes canvases in the overlay pane
// click-through; under that pane, or the canvas would take every SVG path's
// clicks. The halo pane under it rings the selected element.
const PANE = 'fm-changeset-diff';

const HALO = 'fm-changeset-diff-halo';

export default function ChangesetDiffResult(): ReactElement | null {
  const diff = useAppSelector(
    (state) => state.changesetInspector.inspected?.diff,
  );

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

      <Pane name={PANE} className={FEATURES_PANE_CLASS} style={{ zIndex: 397 }}>
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

  const ref = useOwnPaneOpacity(HALO_OPACITY);

  return (
    <Pane
      name={HALO}
      ref={ref}
      className={FEATURES_PANE_CLASS}
      style={{ zIndex: 396 }}
    >
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
