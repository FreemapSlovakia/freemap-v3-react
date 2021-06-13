import { Feature, GeometryObject } from '@turf/helpers';
import { searchSelectResult } from 'fm3/actions/searchActions';
import { getNameFromOsmElement } from 'fm3/osm/osmNameResolver';
import { escapeHtml } from 'fm3/stringUtils';
import { LatLng, Layer, marker, Path, Polygon } from 'leaflet';
import { ReactElement, useCallback } from 'react';
import { GeoJSON } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { MarkerIcon, markerIconOptions, MarkerLeafletIcon } from './RichMarker';

function pointToLayer(_: Feature, latLng: LatLng) {
  return marker(latLng, {
    icon: new MarkerLeafletIcon({
      ...markerIconOptions,
      icon: <MarkerIcon color="#3388ff" />,
    }),
  });
}

function annotateFeature(
  feature: Feature<GeometryObject>,
  layer: Layer,
  language: string,
) {
  getNameFromOsmElement(feature.properties ?? {}, 'node', language).then(
    (text) => {
      const isPoi = !(layer instanceof Path || layer instanceof Polygon);

      layer.bindTooltip(
        escapeHtml(text[0]) +
          (text[1] ? ' <i>' + escapeHtml(text[1]) + '</i>' : ''),
        {
          direction: layer instanceof Polygon ? 'center' : 'top',
          offset: isPoi ? [0, -36] : [0, 0],
        },
      );

      layer.addEventListener('mouseover', () => {
        if (layer instanceof Path) {
          layer.setStyle({ color: '#66bbff' });
        }
      });

      layer.addEventListener('mouseout', () => {
        if (layer instanceof Path) {
          layer.setStyle({ color: '#3388ff' }); // default color
        }
      });
    },
  );
}

export function SearchResults(): ReactElement | null {
  const selectedResult = useSelector((state) => state.search.selectedResult);

  const selectedResultSeq = useSelector(
    (state) => state.search.searchResultSeq,
  );

  const language = useSelector((state) => state.l10n.language);

  const dispatch = useDispatch();

  const cachedAnnotateFeature = useCallback(
    (feature: Feature<GeometryObject>, layer: Layer) =>
      annotateFeature(feature, layer, language),
    [language],
  );

  return !selectedResult ? null : (
    <GeoJSON
      interactive
      key={selectedResultSeq}
      data={selectedResult.geojson}
      style={{ weight: 5 }}
      pointToLayer={pointToLayer}
      onEachFeature={cachedAnnotateFeature}
      eventHandlers={{
        click() {
          dispatch(searchSelectResult(selectedResult));
        },
      }}
    />
  );
}
