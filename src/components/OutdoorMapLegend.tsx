import { Fragment, type ReactElement, useEffect, useState } from 'react';
import { Accordion } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { assert } from 'typia';
import { toastsAdd } from '../actions/toastsActions.js';
import { useEffectiveChosenLanguage } from '../hooks/useEffectiveChosenLanguage.js';
import {
  getGenericNameFromOsmElementSync,
  getOsmMapping,
} from '../osm/osmNameResolver.js';
import { OsmMapping } from '../osm/types.js';

type Item = { name: string; items: { name: string; id: string }[] };

const fmMapserverUrl = process.env['FM_MAPSERVER_URL'];

type Res = { id: string; category: string; tags: Record<string, string> }[];

export default OutdoorMapLegend;

export function OutdoorMapLegend(): ReactElement {
  const [legend, setLegend] = useState<Item[]>([]);

  const dispatch = useDispatch();

  const lang = useEffectiveChosenLanguage();

  const [osmMapping, setOsmMapping] = useState<OsmMapping>();

  useEffect(() => {
    getOsmMapping(lang).then((osmMapping) => setOsmMapping(osmMapping));
  }, [lang]);

  useEffect(() => {
    if (!osmMapping) {
      return;
    }

    console.log(osmMapping);

    fetch(`${fmMapserverUrl}/legend`)
      .then((response) =>
        response.status === 200 ? response.json() : undefined,
      )
      .then((data) => {
        const items = assert<Res>(data);

        const catMap = new Map<string, Item>();

        for (const item of items) {
          let i = catMap.get(item.category);
          if (!i) {
            i = { name: item.category, items: [] };
            catMap.set(item.category, i);
          }

          i.items.push({
            id: item.id,
            name:
              getGenericNameFromOsmElementSync(
                item.tags,
                'relation',
                osmMapping.osmTagToNameMapping,
                osmMapping.colorNames,
              ) +
              ' ' +
              JSON.stringify(item.tags),
          });
        }

        // for (let i = 0; i < items.length; i++) {
        //   catMap
        //     .get(items[i].categoryId)
        //     ?.items.push({ name: items[i].name, id: i });
        // }

        setLegend([...catMap.values()]);
      })
      .catch((err) => {
        dispatch(
          toastsAdd({
            style: 'danger',
            messageKey: 'general.loadError',
            messageParams: { err },
          }),
        );
      });
  }, [dispatch, osmMapping]);

  return (
    <Accordion>
      {[...legend].map((c: Item, i: number) => (
        <Accordion.Item key={c.name} eventKey={String(i)}>
          <Accordion.Header>{c.name}</Accordion.Header>

          <Accordion.Body
            className="d-grid align-items-center row-gap-2 column-gap-3"
            style={{
              gridTemplateColumns: 'auto 1fr',
            }}
          >
            {c.items.map(({ id, name }) => (
              <Fragment key={id}>
                <div>
                  <img
                    src={`${fmMapserverUrl}/legend/${id}`}
                    srcSet={[1, 2, 3]
                      .map(
                        (s) =>
                          `${fmMapserverUrl}/legend/${id}?scale=${s}${
                            s > 1 ? ` ${s}x` : ''
                          }`,
                      )
                      .join(', ')}
                  />
                </div>

                <div>{name}</div>
              </Fragment>
            ))}
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
