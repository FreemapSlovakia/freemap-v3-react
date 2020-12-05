import React, { ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Popup } from 'react-leaflet';

import { RichMarker } from 'fm3/components/RichMarker';
import { getPoiType } from 'fm3/poiTypes';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { selectFeature } from 'fm3/actions/mainActions';

export function ObjectsResult(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

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

        const { name, ele } = tags;

        const nf = Intl.NumberFormat(language, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 1,
        });

        return (
          <RichMarker
            key={`poi-${id}`}
            position={{ lat, lng: lon }}
            image={img}
            onclick={() => {
              dispatch(selectFeature({ type: 'objects', id }));
            }}
            color={activeId === id ? '#65b2ff' : undefined}
          >
            <Popup autoPan={false}>
              <span>
                {pt ? (
                  <>
                    {m?.objects.subcategories[pt.id]}
                    {name && <br />}
                    {name}
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
