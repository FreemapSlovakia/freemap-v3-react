import { drawingStyleToPathOptions } from '@features/drawing/drawingStyleToPathOptions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  getGenericNameFromOsmElement,
  getNameFromOsmElement,
  resolveGenericName,
} from '@osm/osmNameResolver.js';
import { osmTagToIconMapping } from '@osm/osmTagToIconMapping.js';
import { COLORS } from '@shared/colors.js';
import {
  MarkerIcon,
  MarkerLeafletIcon,
  markerIconOptions,
} from '@shared/components/RichMarker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { escapeHtml } from '@shared/stringUtils.js';
import {
  featureIdsEqual,
  stringifyFeatureId,
} from '@shared/types/featureId.js';
import type { Feature } from 'geojson';
import {
  DomEvent,
  type LatLng,
  type Layer,
  type LeafletEventHandlerFnMap,
  marker,
  Path,
  type PathOptions,
} from 'leaflet';
import { type ReactElement, useCallback } from 'react';
import { GeoJSON } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import {
  type SearchResult,
  type SearchSource,
  searchSelectResult,
} from '../model/actions.js';
import { hasGeometry } from '../model/resultUtils.js';

export function SearchResults(): ReactElement | null {
  const selectedResults = useAppSelector(
    (state) => state.search.selectedResults,
  );

  const language = useAppSelector((state) => state.l10n.language);

  // The user-overridable result style. `window.fmHeadless.searchResultStyle`
  // (set by the headless renderer) still wins over it.
  const resultStyle = useAppSelector(
    (state) => state.searchSettings.resultStyle,
  );

  const markerColor =
    window.fmHeadless?.searchResultStyle?.color ?? resultStyle.color;

  // Derived from the RGBA style, unless the headless renderer supplies its own.
  const pathStyle: PathOptions =
    window.fmHeadless?.searchResultStyle ??
    drawingStyleToPathOptions(resultStyle);

  const activeId = useAppSelector((state) =>
    state.main.selection?.type === 'search' ? state.main.selection.id : null,
  );

  const shown = selectedResults.filter(hasGeometry);

  // A result already on the map is not drawn twice for being pointed at.
  const hoverResult = useAppSelector((state) => state.search.hoverResult);

  const hovered =
    hoverResult &&
    hasGeometry(hoverResult) &&
    !shown.some((result) => featureIdsEqual(result.id, hoverResult.id))
      ? hoverResult
      : null;

  // The selected result is marked whether or not others are shown beside it:
  // the map holds drawings, route points and POIs too, so whether the result is
  // the selected feature is a question even when it is the only one. The
  // headless renderer asks for a style outright, and gets it whatever happens.
  const marksActive = !window.fmHeadless?.searchResultStyle;

  return (
    <>
      {shown.map((result) => {
        const active = Boolean(
          marksActive && activeId && featureIdsEqual(result.id, activeId),
        );

        return (
          <ResultGeometry
            key={
              resultKey(result) +
              language +
              markerColor +
              resultStyle.markerType +
              JSON.stringify(pathStyle) +
              active
            }
            result={result}
            markerColor={active ? COLORS.selected : markerColor}
            // Stroke and fill both take the selection color; their opacities
            // are the ones the style was given (`drawingStyleToPathOptions`
            // splits the RGBA into color + opacity), so an area stays as solid
            // or as faint as it was set to be.
            pathStyle={
              active
                ? {
                    ...pathStyle,
                    color: COLORS.selected,
                    fillColor: COLORS.selected,
                  }
                : pathStyle
            }
          />
        );
      })}

      {hovered && (
        <ResultGeometry
          key={`hover:${resultKey(hovered)}${language}${markerColor}${resultStyle.markerType}`}
          result={hovered}
          markerColor={markerColor}
          pathStyle={pathStyle}
          preview
        />
      )}
    </>
  );
}

/**
 * What a result's layers are built from. React-leaflet hands its data to
 * Leaflet once, so geometry arriving later — an incomplete result upgraded to
 * the element itself — reaches the map only through a remount, and the key has
 * to say when that happens.
 *
 * It says nothing about the other results, so picking one doesn't rebuild the
 * layers of every result on the map: a screenful of markers redrawing at once
 * is visible as a flash.
 */
function resultKey(result: SearchResult): string {
  const { geojson } = result;

  return [
    stringifyFeatureId(result.id),
    result.incomplete ? 'incomplete' : 'complete',
    geojson.type === 'Feature'
      ? (geojson.geometry?.type ?? 'none')
      : `collection:${geojson.features.length}`,
  ].join('|');
}

type Props = {
  result: SearchResult;
  markerColor: string;
  pathStyle: PathOptions;
  /**
   * The result is only being pointed at in the list, so it takes neither clicks
   * nor tooltips: the pointer is over the list, and the row under it already
   * says what this is.
   */
  preview?: boolean;
};

function ResultGeometry({
  result,
  markerColor,
  pathStyle,
  preview,
}: Props): ReactElement {
  const isOsm = result.id.type === 'osm';

  const language = useAppSelector((state) => state.l10n.language);

  const markerType = useAppSelector(
    (state) => state.searchSettings.resultStyle.markerType,
  );

  const pointToLayer = useCallback(
    (feature: Feature, latLng: LatLng) => {
      const img = isOsm
        ? resolveGenericName(osmTagToIconMapping, feature.properties ?? {})
        : [];

      // Ring/square markers are centered glyphs, so they anchor at their middle
      // rather than the pin's tip (matches RichMarker).
      const compact = markerType === 'ring' || markerType === 'square';

      return marker(latLng, {
        interactive: !preview,
        icon: new MarkerLeafletIcon({
          ...markerIconOptions,
          iconAnchor: compact ? [12, 12] : markerIconOptions.iconAnchor,
          icon: (
            <MarkerIcon
              color={markerColor}
              markerType={markerType}
              imageOpacity={window.fmHeadless?.searchResultStyle?.opacity ?? 1}
              image={img[0]}
            />
          ),
        }),
      });
    },
    [isOsm, markerColor, markerType, preview],
  );

  const annotateFeature = useCallback(
    async (feature: Feature, layer: Layer) => {
      const genericName: string =
        feature.properties?.['__fm_genericName'] ||
        (isOsm
          ? await getGenericNameFromOsmElement(
              feature.properties ?? {},
              feature.geometry.type === 'Point'
                ? 'node'
                : feature.geometry.type === 'LineString'
                  ? 'way'
                  : 'relation',
              language,
            )
          : '') ||
        '';

      const displayName: string =
        feature.properties?.['__fm_displayName'] ||
        (isOsm
          ? getNameFromOsmElement(feature.properties ?? {}, language)
          : '') ||
        '';

      const isPoi = !(layer instanceof Path);

      if (displayName || genericName) {
        layer.bindTooltip(
          escapeHtml(genericName) +
            (displayName ? ` <i>${escapeHtml(displayName)}</i>` : ''),
          isPoi
            ? // Clear of the pin, whose tip is the position.
              { direction: 'top', offset: [0, -36] }
            : // A line or an area labels itself at the pointer. Anchored at the
              // shape's centre instead, the tooltip covers the very thing it
              // names once the shape is smaller than the label — a building,
              // say — and for a shape large enough that its centre is off the
              // screen, it is drawn where nobody can see it.
              { direction: 'top', sticky: true },
        );
      }
    },
    [isOsm, language],
  );

  const dispatch = useDispatch();

  const m = useMessages();

  // Clicking a result makes it the one being looked at, and changes nothing
  // else: the others stay on the map, and a kept one stays kept.
  const eventHandlers: LeafletEventHandlerFnMap = {
    click(e) {
      DomEvent.stopPropagation(e);

      dispatch(
        searchSelectResult({
          result,
          focus: false,
          tier: 'keep',
        }),
      );
    },
  };

  const geojson =
    result.geojson.type === 'Feature'
      ? {
          ...result.geojson,
          properties: deleteNonstringValues({
            ...result.geojson.properties,
            __fm_genericName: (
              ['bbox', 'coords', 'tile', 'geojson'] as SearchSource[]
            ).includes(result.source)
              ? m?.search.sources[result.source]
              : result.genericName,
            __fm_displayName: result.displayName,
          }),
        }
      : result.geojson;

  return (
    <>
      <GeoJSON
        interactive={false}
        data={geojson}
        style={pathStyle}
        filter={(feature) => feature.geometry?.type === 'LineString'}
      />

      {/* The fat transparent line is what makes a thin one clickable, so a
          preview — which takes no clicks — does without it. */}
      {!preview && (
        <GeoJSON
          interactive
          data={geojson}
          style={{ weight: 15, opacity: 0, color: '#fff' }}
          onEachFeature={annotateFeature}
          filter={(feature) => feature.geometry?.type === 'LineString'}
          eventHandlers={eventHandlers}
        />
      )}

      <GeoJSON
        interactive={!preview}
        data={geojson}
        style={pathStyle}
        pointToLayer={pointToLayer}
        onEachFeature={preview ? undefined : annotateFeature}
        filter={(feature) => feature.geometry?.type !== 'LineString'}
        eventHandlers={preview ? undefined : eventHandlers}
      />
    </>
  );
}

function deleteNonstringValues(props: Record<string, unknown>) {
  for (const key in props) {
    if (typeof props[key] !== 'string') {
      delete props[key];
    }
  }

  return props;
}
