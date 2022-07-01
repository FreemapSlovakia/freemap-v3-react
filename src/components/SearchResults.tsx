import { Feature, GeometryObject } from '@turf/helpers';
import { searchSelectResult } from 'fm3/actions/searchActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import {
  getGenericNameFromOsmElement,
  getNameFromOsmElement,
  resolveGenericName,
} from 'fm3/osm/osmNameResolver';
import { osmTagToIconMapping } from 'fm3/osm/osmTagToIconMapping';
import { escapeHtml } from 'fm3/stringUtils';
import { LatLng, Layer, marker, Path, Polygon } from 'leaflet';
import { Fragment, ReactElement, useCallback } from 'react';
import { GeoJSON } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { MarkerIcon, markerIconOptions, MarkerLeafletIcon } from './RichMarker';

function pointToLayer(feature: Feature, latLng: LatLng) {
  const img = resolveGenericName(osmTagToIconMapping, feature.properties ?? {});

  return marker(latLng, {
    icon: new MarkerLeafletIcon({
      ...markerIconOptions,
      icon: (
        <MarkerIcon
          color={window.fmHeadless?.searchResultStyle?.color ?? '#3388ff'}
          imageOpacity={window.fmHeadless?.searchResultStyle?.opacity ?? 1}
          image={img[0]}
        />
      ),
    }),
  });
}

function annotateFeature(
  feature: Feature<GeometryObject>,
  layer: Layer,
  language: string,
  isBg: boolean,
) {
  getGenericNameFromOsmElement(feature.properties ?? {}, 'node', language).then(
    (genericName) => {
      const name = getNameFromOsmElement(feature.properties ?? {}, language);

      const isPoi = !(layer instanceof Path || layer instanceof Polygon);

      layer.bindTooltip(
        escapeHtml(genericName) +
          (name ? ' <i>' + escapeHtml(name) + '</i>' : ''),
        {
          direction: layer instanceof Polygon ? 'center' : 'top',
          offset: isPoi ? [0, -36] : [0, 0],
        },
      );

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
  );
}

export function SearchResults(): ReactElement | null {
  const selectedResult = useAppSelector((state) => state.search.selectedResult);

  const selectedResultSeq = useAppSelector(
    (state) => state.search.searchResultSeq,
  );

  const language = useAppSelector((state) => state.l10n.language);

  const dispatch = useDispatch();

  const cachedAnnotateFeatureBg = useCallback(
    (feature: Feature<GeometryObject>, layer: Layer) =>
      annotateFeature(feature, layer, language, true),
    [language],
  );

  const cachedAnnotateFeature = useCallback(
    (feature: Feature<GeometryObject>, layer: Layer) =>
      annotateFeature(feature, layer, language, false),
    [language],
  );

  if (!selectedResult?.geojson) {
    return null;
  }

  return (
    <Fragment key={language + selectedResultSeq}>
      <GeoJSON
        interactive={false}
        data={selectedResult.geojson}
        style={{ weight: 5 }}
        filter={(feature) => feature.geometry.type === 'LineString'}
      />

      <GeoJSON
        interactive
        data={selectedResult.geojson}
        style={{ weight: 15, opacity: 0, color: '#fff' }}
        onEachFeature={cachedAnnotateFeatureBg}
        filter={(feature) => feature.geometry.type === 'LineString'}
        eventHandlers={{
          click() {
            dispatch(
              searchSelectResult({
                result: selectedResult,
                showToast: true,
                zoomTo: false,
              }),
            );
          },
        }}
      />

      <GeoJSON
        interactive
        data={selectedResult.geojson}
        style={window.fmHeadless?.searchResultStyle ?? { weight: 5 }}
        pointToLayer={pointToLayer}
        onEachFeature={cachedAnnotateFeature}
        filter={(feature) => feature.geometry.type !== 'LineString'}
        eventHandlers={{
          click() {
            dispatch(
              searchSelectResult({
                result: selectedResult,
                showToast: true,
                zoomTo: false,
              }),
            );
          },
        }}
      />
    </Fragment>
  );
}
