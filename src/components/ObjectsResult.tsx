import { selectFeature } from 'fm3/actions/mainActions';
import { RichMarker } from 'fm3/components/RichMarker';
import { colors } from 'fm3/constants';
import { useMessages } from 'fm3/l10nInjector';
import { getPoiType } from 'fm3/poiTypes';
import { selectingModeSelector } from 'fm3/selectors/mainSelectors';
import { RootState } from 'fm3/storeCreator';
import { ReactElement } from 'react';
import { Popup } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';

export function ObjectsResult(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const interactive = useSelector(selectingModeSelector);

  const objects = useSelector((state: RootState) => state.objects.objects);

  const language = useSelector((state: RootState) => state.l10n.language);

  const activeId = useSelector((state: RootState) =>
    state.main.selection?.type === 'objects'
      ? state.main.selection.id ?? null
      : null,
  );

  return (
    <>
      {objects.map(({ id, lat, lon, tags, typeId }) => {
        const pt = getPoiType(typeId);

        const img = pt ? require(`../images/mapIcons/${pt.icon}.png`) : null;

        const { name, ele, operator } = tags;

        const nf = Intl.NumberFormat(language, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 1,
        });

        return (
          <RichMarker
            key={`poi-${id}-${interactive ? 'a' : 'b'}`}
            interactive={interactive}
            position={{ lat, lng: lon }}
            image={img}
            eventHandlers={{
              click() {
                dispatch(selectFeature({ type: 'objects', id }));
              },
            }}
            color={activeId === id ? colors.selected : undefined}
          >
            <Popup autoPan={false}>
              <span>
                {pt ? (
                  <>
                    {m?.objects.subcategories[pt.id]}
                    {(name || operator) && <br />}
                    {name || operator}
                    {ele && <br />}
                    {ele && `${nf.format(parseFloat(ele))} ${m?.general.masl}`}
                  </>
                ) : (
                  name
                )}
              </span>
            </Popup>
          </RichMarker>
        );
      })}
    </>
  );
}
