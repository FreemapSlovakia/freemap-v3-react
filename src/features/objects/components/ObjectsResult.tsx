import { selectFeature } from '@app/store/actions.js';
import { selectingModeSelector } from '@app/store/selectors.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { getNameFromOsmElement } from '@osm/osmNameResolver.js';
import { osmPoiKind } from '@osm/osmPoiKind.js';
import { useOsmMapping } from '@osm/useOsmMapping.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import { SELECTION_COLOR } from '@shared/halo.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useEffectiveChosenLanguage } from '@shared/hooks/useEffectiveChosenLanguage.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { labelTooltipMode } from '@shared/labelVisibility.js';
import {
  featureIdsEqual,
  OsmFeatureIdSchema,
  stringifyFeatureId,
} from '@shared/types/featureId.js';
import type { ReactElement } from 'react';
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

  const osmMapping = useOsmMapping(language);

  const nf = useNumberFormat({
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  const markerType = useAppSelector(
    (state) => state.objectsSettings.selectedIcon,
  );

  const color = useAppSelector((state) => state.objectsSettings.color);

  const labelVisibility = useAppSelector(
    (state) => state.objectsSettings.labelVisibility,
  );

  return !osmMapping
    ? null
    : objects.map(({ id, coords, tags }) => {
        const name = getNameFromOsmElement(tags, language);

        const parsed = OsmFeatureIdSchema.safeParse(id);

        const { poi, generic: gn } = osmPoiKind(
          tags,
          parsed.success ? parsed.data.elementType : undefined,
          osmMapping,
        );

        const { ele } = tags;

        const access = tags['access'];

        const selected = Boolean(activeId && featureIdsEqual(activeId, id));

        const labelMode = labelTooltipMode(labelVisibility, selected);

        return (
          <RichMarker
            key={`poi-${stringifyFeatureId(id)}`}
            interactive={interactive}
            position={{ lat: coords.lat, lng: coords.lon }}
            poi={poi}
            poiOpacity={access === 'private' || access === 'no' ? 0.33 : 1.0}
            color={color}
            // Selection is the ring, so the marker keeps the color the objects
            // settings give every POI.
            halo={selected ? SELECTION_COLOR : undefined}
            markerType={markerType}
            eventHandlers={{
              click() {
                dispatch(selectFeature({ type: 'objects', id }));
              },
            }}
          >
            {labelMode && (
              <Tooltip
                key={`${selectedIconValue}-${labelMode}`}
                direction="top"
                permanent={labelMode === 'permanent'}
              >
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
            )}
          </RichMarker>
        );
      });
}
