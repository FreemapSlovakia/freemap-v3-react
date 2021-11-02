import { selectFeature } from 'fm3/actions/mainActions';
import { searchSelectResult } from 'fm3/actions/searchActions';
import { RichMarker } from 'fm3/components/RichMarker';
import { colors } from 'fm3/constants';
import { useEffectiveChosenLanguage } from 'fm3/hooks/useEffectiveChosenLanguage';
import { useNumberFormat } from 'fm3/hooks/useNumberFormat';
import { useMessages } from 'fm3/l10nInjector';
import {
  adjustTagOrder,
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

export function ObjectsResult(): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const interactive = useSelector(selectingModeSelector);

  const objects = useSelector((state) => state.objects.objects);

  const language = useEffectiveChosenLanguage();

  const activeId = useSelector((state) =>
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

        const img = resolveGenericName(
          osmTagToIconMapping,
          adjustTagOrder(tags),
        );

        const { ele } = tags;

        return (
          <RichMarker
            key={`poi-${id}-${interactive ? 'a' : 'b'}`}
            interactive={interactive}
            position={{ lat, lng: lon }}
            image={img[0]}
            eventHandlers={{
              click() {
                dispatch(selectFeature({ type: 'objects', id }));
                dispatch(
                  searchSelectResult({
                    result: { id, tags, osmType: type, detailed: true },
                    showToast: true,
                    zoomTo: false,
                    storeResult: false,
                  }),
                );
              },
            }}
            color={activeId === id ? colors.selected : undefined}
          >
            <Tooltip direction="top" offset={[0, -36]}>
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
