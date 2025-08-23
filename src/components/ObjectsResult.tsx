import { point } from '@turf/helpers';
import { type ReactElement, useEffect, useState } from 'react';
import { Tooltip } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { selectFeature } from '../actions/mainActions.js';
import { searchSelectResult } from '../actions/searchActions.js';
import { colors } from '../constants.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useEffectiveChosenLanguage } from '../hooks/useEffectiveChosenLanguage.js';
import { useNumberFormat } from '../hooks/useNumberFormat.js';
import { useMessages } from '../l10nInjector.js';
import {
  getGenericNameFromOsmElementSync,
  getNameFromOsmElement,
  getOsmMapping,
  resolveGenericName,
} from '../osm/osmNameResolver.js';
import { osmTagToIconMapping } from '../osm/osmTagToIconMapping.js';
import { OsmMapping } from '../osm/types.js';
import { selectingModeSelector } from '../selectors/mainSelectors.js';
import type { RootState } from '../store.js';
import { featureIdsEqual } from '../types/featureId.js';
import { RichMarker } from './RichMarker.js';

export function ObjectsResult(): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const selectedIconValue = useSelector(
    (state: RootState) => state.objects.selectedIcon,
  );

  const interactive = useAppSelector(selectingModeSelector);

  const objects = useAppSelector((state) => state.objects.objects);

  const language = useEffectiveChosenLanguage();

  const activeId = useAppSelector((state) =>
    state.main.selection?.type === 'objects'
      ? (state.main.selection.id ?? null)
      : null,
  );

  const [osmMapping, setOsmMapping] = useState<OsmMapping>();

  useEffect(() => {
    getOsmMapping(language).then(setOsmMapping);
  }, [language]);

  const nf = useNumberFormat({
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  const markerType = useSelector(
    (state: RootState) => state.objects.selectedIcon,
  );

  return !osmMapping ? null : (
    <>
      {objects.map(({ id, coords, tags }) => {
        const name = getNameFromOsmElement(tags, language);

        const gn = getGenericNameFromOsmElementSync(
          tags,
          id.type,
          osmMapping.osmTagToNameMapping,
          osmMapping.colorNames,
        );

        const img = resolveGenericName(osmTagToIconMapping, tags);

        const { ele } = tags;

        const access = tags['access'];

        return (
          <RichMarker
            key={`poi-${id.type}-${id.id}-${interactive ? 'a' : 'b'}`}
            interactive={interactive}
            position={{ lat: coords.lat, lng: coords.lon }}
            image={img[0]}
            imageOpacity={access === 'private' || access === 'no' ? 0.33 : 1.0}
            color={
              activeId && featureIdsEqual(activeId, id)
                ? colors.selected
                : undefined
            }
            markerType={markerType}
            eventHandlers={{
              click() {
                dispatch(selectFeature({ type: 'objects', id }));

                dispatch(
                  searchSelectResult({
                    result: {
                      id,
                      source: 'overpass-objects',
                      geojson: point([coords.lon, coords.lat], tags),
                    },
                    showToast: true,
                    focus: false,
                    storeResult: false,
                  }),
                );
              },
            }}
          >
            <Tooltip key={selectedIconValue} direction="top">
              <span>
                {/* {m?.objects.subcategories[pt.id]} */}
                {gn} <i>{name}</i>
                {ele && <br />}
                {ele && `${nf.format(parseFloat(ele))} ${m?.general.masl}`}
              </span>
            </Tooltip>
          </RichMarker>
        );
      })}
    </>
  );
}
