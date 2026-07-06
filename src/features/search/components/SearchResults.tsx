import { drawingStyleToPathOptions } from '@features/drawing/drawingStyleToPathOptions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  getGenericNameFromOsmElement,
  getNameFromOsmElement,
  resolveGenericName,
} from '@osm/osmNameResolver.js';
import { osmTagToIconMapping } from '@osm/osmTagToIconMapping.js';
import {
  MarkerIcon,
  MarkerLeafletIcon,
  markerIconOptions,
} from '@shared/components/RichMarker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { escapeHtml } from '@shared/stringUtils.js';
import type { Feature } from 'geojson';
import {
  DomEvent,
  type LatLng,
  type Layer,
  type LeafletEventHandlerFnMap,
  marker,
  Path,
  type PathOptions,
  Polygon,
} from 'leaflet';
import { Fragment, type ReactElement, useCallback } from 'react';
import { GeoJSON } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { type SearchSource, searchSelectResult } from '../model/actions.js';

export function SearchResults(): ReactElement | null {
  const selectedResult = useAppSelector((state) => state.search.selectedResult);

  const isOsm = selectedResult?.id.type === 'osm';

  const language = useAppSelector((state) => state.l10n.language);

  // The user-overridable result style. `window.fmHeadless.searchResultStyle`
  // (set by the headless renderer) still wins over it.
  const resultStyle = useAppSelector(
    (state) => state.searchSettings.resultStyle,
  );

  const markerColor =
    window.fmHeadless?.searchResultStyle?.color ?? resultStyle.color;

  const pointToLayer = useCallback(
    (feature: Feature, latLng: LatLng) => {
      const img = isOsm
        ? resolveGenericName(osmTagToIconMapping, feature.properties ?? {})
        : [];

      // Ring/square markers are centered glyphs, so they anchor at their middle
      // rather than the pin's tip (matches RichMarker).
      const compact =
        resultStyle.markerType === 'ring' ||
        resultStyle.markerType === 'square';

      return marker(latLng, {
        icon: new MarkerLeafletIcon({
          ...markerIconOptions,
          iconAnchor: compact ? [12, 12] : markerIconOptions.iconAnchor,
          icon: (
            <MarkerIcon
              color={markerColor}
              markerType={resultStyle.markerType}
              imageOpacity={window.fmHeadless?.searchResultStyle?.opacity ?? 1}
              image={img[0]}
            />
          ),
        }),
      });
    },
    [isOsm, markerColor, resultStyle.markerType],
  );

  const annotateFeature = useCallback(
    async (feature: Feature, layer: Layer, isBg: boolean) => {
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

      const isPoi = !(layer instanceof Path || layer instanceof Polygon);

      if (displayName || genericName) {
        layer.bindTooltip(
          escapeHtml(genericName) +
            (displayName ? ' <i>' + escapeHtml(displayName) + '</i>' : ''),
          {
            direction: layer instanceof Polygon ? 'center' : 'top',
            offset: isPoi ? [0, -36] : [0, 0],
          },
        );
      }

      layer.addEventListener('mouseover', () => {
        if (layer instanceof Path) {
          layer.setStyle({ opacity: 0.5, fillOpacity: 0.125 });
        }
      });

      layer.addEventListener('mouseout', () => {
        if (layer instanceof Path) {
          layer.setStyle({ opacity: isBg ? 0 : 1, fillOpacity: 0.25 });
        }
      });
    },
    [isOsm, language],
  );

  const selectedResultSeq = useAppSelector(
    (state) => state.search.searchResultSeq,
  );

  const dispatch = useDispatch();

  const cachedAnnotateFeatureBg = useCallback(
    (feature: Feature, layer: Layer) => annotateFeature(feature, layer, true),
    [annotateFeature],
  );

  const cachedAnnotateFeature = useCallback(
    (feature: Feature, layer: Layer) => annotateFeature(feature, layer, false),
    [annotateFeature],
  );

  const m = useMessages();

  if (!selectedResult?.geojson) {
    return null;
  }

  // Derived from the RGBA style, unless the headless renderer supplies its own.
  const pathStyle: PathOptions =
    window.fmHeadless?.searchResultStyle ??
    drawingStyleToPathOptions(resultStyle);

  const eventHandlers: LeafletEventHandlerFnMap = {
    click(e) {
      DomEvent.stopPropagation(e);

      dispatch(
        searchSelectResult({
          result: selectedResult,
          showToast: true,
          focus: false,
        }),
      );
    },
  };

  const geojson =
    selectedResult.geojson.type === 'Feature'
      ? {
          ...selectedResult.geojson,
          properties: deleteNonstringValues({
            ...selectedResult.geojson.properties,
            __fm_genericName: (
              ['bbox', 'coords', 'tile', 'geojson'] as SearchSource[]
            ).includes(selectedResult.source)
              ? m?.search.sources[selectedResult.source]
              : selectedResult.genericName,
            __fm_displayName: selectedResult.displayName,
          }),
        }
      : selectedResult.geojson;

  return (
    // Remount on style change too: react-leaflet keeps `pointToLayer` markers
    // from their initial render, so a style edit wouldn't reach them otherwise.
    <Fragment
      key={
        language +
        selectedResultSeq +
        markerColor +
        resultStyle.markerType +
        JSON.stringify(pathStyle)
      }
    >
      <GeoJSON
        interactive={false}
        data={geojson}
        style={pathStyle}
        filter={(feature) => feature.geometry?.type === 'LineString'}
      />

      <GeoJSON
        interactive
        data={geojson}
        style={{ weight: 15, opacity: 0, color: '#fff' }}
        onEachFeature={cachedAnnotateFeatureBg}
        filter={(feature) => feature.geometry?.type === 'LineString'}
        eventHandlers={eventHandlers}
      />

      <GeoJSON
        interactive
        data={geojson}
        style={pathStyle}
        pointToLayer={pointToLayer}
        onEachFeature={cachedAnnotateFeature}
        filter={(feature) => feature.geometry?.type !== 'LineString'}
        eventHandlers={eventHandlers}
      />
    </Fragment>
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
