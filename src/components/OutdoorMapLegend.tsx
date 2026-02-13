import {
  Fragment,
  type ReactElement,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Accordion, Table } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { assert } from 'typia';
import { toastsAdd } from '../actions/toastsActions.js';
import { useEffectiveChosenLanguage } from '../hooks/useEffectiveChosenLanguage.js';
import {
  getGenericNameFromOsmElementSync,
  getOsmMapping,
} from '../osm/osmNameResolver.js';
import { OsmMapping } from '../osm/types.js';
import { LongPressTooltip } from './LongPressTooltip.js';
import { useMessages } from '../l10nInjector.js';

type Item = {
  category: string;
  items: {
    id: string;
    name_w_tags: { name: string; tags: Record<string, string> }[];
  }[];
};

const fmMapserverUrl = process.env['FM_MAPSERVER_URL'];

type Res = { id: string; category: string; tags: Record<string, string>[] }[];

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
            i = { category: item.category, items: [] };
            catMap.set(item.category, i);
          }

          i.items.push({
            id: item.id,
            name_w_tags: item.tags.map((tags) => ({
              name: getGenericNameFromOsmElementSync(
                tags,
                'relation',
                osmMapping.osmTagToNameMapping,
                osmMapping.colorNames,
              ),
              tags,
            })),
          });
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
  }, [dispatch, osmMapping]);

  const m = useMessages();

  const orderedLegend = useMemo(() => {
    const outdoorMap = m?.legend.outdoorMap as
      | Record<string, string>
      | undefined;

    if (!outdoorMap) {
      return legend;
    }

    const order = new Map<string, number>();

    let i = 0;

    for (const key of Object.keys(outdoorMap)) {
      order.set(key, i++);
    }

    return [...legend].sort(
      (a, b) =>
        (order.get(a.category) ?? Number.MAX_SAFE_INTEGER) -
        (order.get(b.category) ?? Number.MAX_SAFE_INTEGER),
    );
  }, [legend, m]);

  return (
    <Accordion>
      {orderedLegend.map((c: Item, i: number) => (
        <Accordion.Item key={c.category} eventKey={String(i)}>
          <Accordion.Header>
            {(m?.legend.outdoorMap as Record<string, string>)[c.category] ??
              c.category}
          </Accordion.Header>

          <Accordion.Body
            className="d-grid align-items-center row-gap-2 column-gap-3"
            style={{ gridTemplateColumns: 'auto 1fr' }}
          >
            {c.items.map(({ id, name_w_tags }) => (
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

                <div>
                  {name_w_tags.map(({ name, tags }, i) => (
                    <Fragment key={i}>
                      {i ? '｜' : null}
                      <LongPressTooltip
                        label={
                          <Table className="text-left mb-0" bordered size="sm">
                            <tbody>
                              {Object.entries(tags).map(([key, value]) => (
                                <tr>
                                  <th>{key}</th>
                                  <td>{value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        }
                      >
                        {({ props }) => (
                          <span
                            style={{
                              textDecoration: 'underline dotted',
                              cursor: 'help',
                            }}
                            {...props}
                          >
                            {name?.replace(/\s*\*\s*/g, '') || '???'}
                          </span>
                        )}
                      </LongPressTooltip>
                    </Fragment>
                  ))}
                </div>
              </Fragment>
            ))}
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
