import { selectFeature } from 'fm3/actions/mainActions';
import { searchSelectResult } from 'fm3/actions/searchActions';
import { colors } from 'fm3/constants';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useEffectiveChosenLanguage } from 'fm3/hooks/useEffectiveChosenLanguage';
import { useNumberFormat } from 'fm3/hooks/useNumberFormat';
import { useMessages } from 'fm3/l10nInjector';
import {
  getGenericNameFromOsmElementSync,
  getNameFromOsmElement,
  getOsmMapping,
  resolveGenericName,
} from 'fm3/osm/osmNameResolver';
import { osmTagToIconMapping } from 'fm3/osm/osmTagToIconMapping';
import { OsmMapping } from 'fm3/osm/types';
import { selectingModeSelector } from 'fm3/selectors/mainSelectors';
import { ReactElement, useEffect, useState } from 'react';
import { Tooltip } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'fm3/reducers';
import { RichMarker } from './RichMarker';

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
      {objects.map(({ id, lat, lon, tags, type }) => {
        const name = getNameFromOsmElement(tags, language);

        const gn = getGenericNameFromOsmElementSync(
          tags,
          type,
          osmMapping.osmTagToNameMapping,
          osmMapping.colorNames,
        );

        const img = resolveGenericName(osmTagToIconMapping, tags);

        const { ele } = tags;

        const access = tags['access'];

        return (
          <RichMarker
            key={`poi-${id}-${interactive ? 'a' : 'b'}`}
            interactive={interactive}
            position={{ lat, lng: lon }}
            image={img[0]}
            imageOpacity={access === 'private' || access === 'no' ? 0.33 : 1.0}
            color={activeId === id ? colors.selected : undefined}
            markerType={markerType}
            eventHandlers={{
              click() {
                dispatch(selectFeature({ type: 'objects', id }));

                dispatch(
                  searchSelectResult({
                    result: { id, tags, osmType: type, detailed: true },
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
