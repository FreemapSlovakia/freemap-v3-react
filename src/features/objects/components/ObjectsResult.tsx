import { selectFeature } from '@app/store/actions.js';
import { selectingModeSelector } from '@app/store/selectors.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  getGenericNameFromOsmElementSync,
  getNameFromOsmElement,
  getOsmMapping,
  resolveGenericName,
} from '@osm/osmNameResolver.js';
import { osmTagToIconMapping } from '@osm/osmTagToIconMapping.js';
import type { OsmMapping } from '@osm/types.js';
import { COLORS } from '@shared/colors.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useEffectiveChosenLanguage } from '@shared/hooks/useEffectiveChosenLanguage.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import {
  featureIdsEqual,
  OsmFeatureIdSchema,
  stringifyFeatureId,
} from '@shared/types/featureId.js';
import { type ReactElement, useEffect, useState } from 'react';
import { Tooltip } from 'react-leaflet';
import { useDispatch } from 'react-redux';

export function ObjectsResult(): ReactElement | ReactElement[] | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const selectedIconValue = useAppSelector(
    (state) => state.objectsSettings.selectedIcon,
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

  const markerType = useAppSelector(
    (state) => state.objectsSettings.selectedIcon,
  );

  const color = useAppSelector((state) => state.objectsSettings.color);

  return !osmMapping
    ? null
    : objects.map(({ id, coords, tags }) => {
        const name = getNameFromOsmElement(tags, language);

        const parsed = OsmFeatureIdSchema.safeParse(id);

        const gn = parsed.success
          ? getGenericNameFromOsmElementSync(
              tags,
              parsed.data.elementType,
              osmMapping.osmTagToNameMapping,
              osmMapping.colorNames,
            )
          : '';

        const img = resolveGenericName(osmTagToIconMapping, tags);

        const { ele } = tags;

        const access = tags['access'];

        return (
          <RichMarker
            key={`poi-${stringifyFeatureId(id)}`}
            interactive={interactive}
            position={{ lat: coords.lat, lng: coords.lon }}
            poi={img[0]}
            poiOpacity={access === 'private' || access === 'no' ? 0.33 : 1.0}
            color={
              activeId && featureIdsEqual(activeId, id)
                ? COLORS.selected
                : color
            }
            markerType={markerType}
            eventHandlers={{
              click() {
                dispatch(selectFeature({ type: 'objects', id }));
              },
            }}
          >
            <Tooltip key={selectedIconValue} direction="top">
              <span>
                {/* {m?.objects.subcategories[pt.id]} */}
                {/* Named first, kind of thing second — as the search list reads. */}
                {name && <b>{name}</b>}
                {name && gn && ' '}
                {gn}
                {ele && <br />}
                {ele && `${nf.format(parseFloat(ele))} ${m?.general.masl}`}
              </span>
            </Tooltip>
          </RichMarker>
        );
      });
}
