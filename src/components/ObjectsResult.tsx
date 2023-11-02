import { selectFeature } from 'fm3/actions/mainActions';
import { searchSelectResult } from 'fm3/actions/searchActions';
/* import { RichMarker } from 'fm3/components/RichMarker'; */
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

import { ObjectMarker } from './ObjectMarker';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'fm3/reducers';


export function ObjectsResult(): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();
  const selectedIconValue = useSelector(
    (state: RootState) => state.main.selectedIcon,
  );

  const getTooltipOffset = (selectedIconValue: string) => {
    return selectedIconValue === "default" ? [0, -36] : [0, -16] as [number,number]
  }

  const interactive = useAppSelector(selectingModeSelector);

  const objects = useAppSelector((state) => state.objects.objects);

  const language = useEffectiveChosenLanguage();

  const activeId = useAppSelector((state) =>
    state.main.selection?.type === 'objects'
      ? state.main.selection.id ?? null
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

  if (!osmMapping) {
    return null;
  }


  return (
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
          <ObjectMarker
            key={`poi-${id}-${interactive ? 'a' : 'b'}`}
            interactive={interactive}
            position={{ lat, lng: lon }}
            image={img[0]}
            imageOpacity={access === 'private' || access === 'no' ? 0.33 : 1.0}
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
            color={activeId === id ? colors.selected : undefined}
          >
            <Tooltip key={selectedIconValue} direction="top" offset={getTooltipOffset(selectedIconValue) as [number, number]}>
              <span>
                {/* {m?.objects.subcategories[pt.id]} */}
                {gn} <i>{name}</i>
                {ele && <br />}
                {ele && `${nf.format(parseFloat(ele))} ${m?.general.masl}`}
              </span>
            </Tooltip>
          </ObjectMarker>
        );
      })}
    </>
  );
}
