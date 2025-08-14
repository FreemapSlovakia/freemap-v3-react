import { Fragment, type ReactElement, useEffect, useState } from 'react';
import { Accordion } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { assert } from 'typia';
import { toastsAdd } from '../actions/toastsActions.js';
import { useEffectiveChosenLanguage } from '../hooks/useEffectiveChosenLanguage.js';

type Item = { name: string; items: { name: string; id: number }[] };

const fmMapserverUrl = process.env['FM_MAPSERVER_URL'];

type Res = {
  categories: { id: string; name: string }[];
  items: { categoryId: string; name: string }[];
};

export default OutdoorMapLegend;

export function OutdoorMapLegend(): ReactElement {
  const [legend, setLegend] = useState<Item[]>([]);

  const language = useEffectiveChosenLanguage();

  const dispatch = useDispatch();

  useEffect(() => {
    fetch(`${fmMapserverUrl}/legend?language=${language}`)
      .then((response) =>
        response.status === 200 ? response.json() : undefined,
      )
      .then((data) => {
        const { categories, items } = assert<Res>(data);

        const catMap = new Map<string, Item>();

        for (const category of categories) {
          catMap.set(category.id, { name: category.name, items: [] });
        }

        for (let i = 0; i < items.length; i++) {
          catMap
            .get(items[i].categoryId)
            ?.items.push({ name: items[i].name, id: i });
        }

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
  }, [dispatch, language]);

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
                    src={`${fmMapserverUrl}/legend-image/${id}`}
                    srcSet={[1, 2, 3]
                      .map(
                        (s) =>
                          `${fmMapserverUrl}/legend-image/${id}?scale=${s}${
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
