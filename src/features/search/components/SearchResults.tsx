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
import { Feature } from 'geojson';
import {
  DomEvent,
  LatLng,
  Layer,
  LeafletEventHandlerFnMap,
  marker,
  Path,
  Polygon,
} from 'leaflet';
import { Fragment, ReactElement, useCallback } from 'react';
import { GeoJSON } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { SearchSource, searchSelectResult } from '../model/actions.js';

export function SearchResults(): ReactElement | null {
  const selectedResult = useAppSelector((state) => state.search.selectedResult);

  const isOsm = selectedResult?.id.type === 'osm';

  const language = useAppSelector((state) => state.l10n.language);

  const pointToLayer = useCallback(
    (feature: Feature, latLng: LatLng) => {
      const img = isOsm
        ? resolveGenericName(osmTagToIconMapping, feature.properties ?? {})
        : [];

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
    },
    [isOsm],
  );

  const annotateFeature = useCallback(
    async (feature: Feature, layer: Layer, isBg: boolean) => {
      const genericName =
        feature.properties?.['__fm_genericName'] ||
        (isOsm &&
          (await getGenericNameFromOsmElement(
            feature.properties ?? {},
            feature.geometry.type === 'Point'
              ? 'node'
              : feature.geometry.type === 'LineString'
                ? 'way'
                : 'relation',
            language,
          )));

      const displayName =
        feature.properties?.['__fm_displayName'] ||
        (isOsm && getNameFromOsmElement(feature.properties ?? {}, language));

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
    <Fragment key={language + selectedResultSeq}>
      <GeoJSON
        interactive={false}
        data={geojson}
        style={{ weight: 5 }}
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
        style={window.fmHeadless?.searchResultStyle ?? { weight: 5 }}
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
