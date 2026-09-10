import { useMessages } from '@features/l10n/l10nInjector.js';
import { objectsSetFilter } from '@features/objects/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import {
  getGenericNameFromOsmElementSync,
  getOsmMapping,
} from '@osm/osmNameResolver.js';
import type { OsmMapping } from '@osm/types.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { fuzzyMatch } from '@shared/fuzzyMatch.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useEffectiveChosenLanguage } from '@shared/hooks/useEffectiveChosenLanguage.js';
import clsx from 'clsx';
import {
  Fragment,
  type ReactElement,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Accordion, Form, InputGroup, Table } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import z from 'zod';
import { useLegendMessages } from '../translations/useLegendMessages.js';

type Item = {
  category: string;
  items: {
    id: string;
    name_w_tags: { name: string; tags: Record<string, string> }[];
  }[];
};

/** The mapping marks the spot a value would go with `*`; it reads as noise. */
const strippedName = (name: string | undefined) =>
  name?.replace(/\s*\*\s*/g, '') ?? '';

/** Shorter than this a fuzzy query keeps most of the legend, so it isn't run. */
const minQueryLength = 2;

const fmMapserverUrl = process.env['FM_MAPSERVER_URL'];

const ResSchema = z.array(
  z.object({
    id: z.string(),
    category: z.string(),
    tags: z.array(z.record(z.string(), z.string())),
  }),
);

export default function OutdoorMapLegend(): ReactElement {
  // The map renders differently by zoom, so the legend is asked for the zoom
  // the user is currently looking at — rounded, because the renderer styles by
  // whole zoom levels and the endpoint rejects anything else outright.
  const zoom = useAppSelector((s) => Math.round(s.map.zoom));

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

    fetch(`${fmMapserverUrl}/legend?zoom=${zoom}`)
      .then((response) =>
        response.status === 200 ? response.json() : undefined,
      )
      .then((data) => {
        const items = ResSchema.parse(data);

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
            id: 'outdoorLegend',
            style: 'danger',
            messageKey: 'general.loadError',
            messageParams: { err },
          }),
        );
      });
  }, [dispatch, osmMapping, zoom]);

  const lm = useLegendMessages();

  const collator = useMemo(() => new Intl.Collator(lang), [lang]);

  const orderedLegend = useMemo(() => {
    const names = (lm?.outdoorMap ?? {}) as Record<string, string>;

    // Alphabetical, except the catch-all, which belongs after the named ones.
    return [...legend].sort(
      (a, b) =>
        Number(a.category === 'other') - Number(b.category === 'other') ||
        collator.compare(
          names[a.category] ?? a.category,
          names[b.category] ?? b.category,
        ),
    );
  }, [collator, legend, lm]);

  const m = useMessages();

  const [query, setQuery] = useState('');

  const categoryName = (category: string) =>
    (lm?.outdoorMap as Record<string, string>)?.[category] ?? category;

  const filtering = query.trim().length >= minQueryLength;

  const filteredLegend = useMemo(() => {
    const q = query.trim();

    if (q.length < minQueryLength) {
      return orderedLegend;
    }

    const names = (lm?.outdoorMap ?? {}) as Record<string, string>;

    return orderedLegend
      .map((c) => {
        // A category matched by its own name shows everything it holds.
        if (fuzzyMatch(q, names[c.category] ?? c.category)) {
          return c;
        }

        const items = c.items.filter(({ name_w_tags }) =>
          name_w_tags.some(
            ({ name, tags }) =>
              fuzzyMatch(q, strippedName(name)) ||
              Object.entries(tags).some(([k, v]) => fuzzyMatch(q, `${k}=${v}`)),
          ),
        );

        return items.length === 0 ? null : { ...c, items };
      })
      .filter((c) => c !== null);
  }, [lm, orderedLegend, query]);

  return (
    <>
      <InputGroup className="mb-3">
        <InputGroup.Text>
          <FaSearch />
        </InputGroup.Text>

        <Form.Control
          type="search"
          value={query}
          placeholder={lm?.filter}
          onChange={(e) => setQuery(e.currentTarget.value)}
        />
      </InputGroup>

      {!filtering ? (
        <Accordion>
          {filteredLegend.map((c: Item, i: number) => (
            <Accordion.Item key={c.category} eventKey={String(i)}>
              <Accordion.Header>{categoryName(c.category)}</Accordion.Header>

              <Accordion.Body>
                <LegendItems items={c.items} zoom={zoom} />
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      ) : filteredLegend.length === 0 ? (
        <p className="text-body-secondary">{m?.search.noResults}</p>
      ) : (
        filteredLegend.map((c: Item) => (
          <div key={c.category} className="mb-3">
            <div className="fw-bold mb-2">{categoryName(c.category)}</div>

            <LegendItems items={c.items} zoom={zoom} />
          </div>
        ))
      )}
    </>
  );
}

function LegendItems({
  items,
  zoom,
}: {
  items: Item['items'];
  zoom: number;
}): ReactElement {
  const activeObjects = useAppSelector((s) => s.objects.active);

  const dispatch = useDispatch();

  return (
    <div
      className="d-grid align-items-center row-gap-2 column-gap-3"
      style={{ gridTemplateColumns: 'auto 1fr' }}
    >
      {items.map(({ id, name_w_tags }) => (
        <Fragment key={id}>
          <div>
            <img
              alt={name_w_tags.map(({ name }) => name).join(', ')}
              src={`${fmMapserverUrl}/legend/${id}?zoom=${zoom}`}
              srcSet={[1, 2, 3]
                .map(
                  (s) =>
                    `${fmMapserverUrl}/legend/${id}?zoom=${zoom}&scale=${s}${
                      s > 1 ? ` ${s}x` : ''
                    }`,
                )
                .join(', ')}
            />
          </div>

          <div className="d-flex flex-wrap gap-2">
            {name_w_tags.map(({ name, tags }, i) => {
              const ts = Object.entries(tags).map(([k, v]) => `${k}=${v}`);

              const activeIndex = activeObjects.findIndex((ao) => {
                const aos = ao.split(',');

                return (
                  aos.every((t) => ts.includes(t)) &&
                  ts.every((t) => aos.includes(t))
                );
              });

              return (
                <LongPressTooltip
                  key={i}
                  label={
                    <Table
                      className="text-left mb-0"
                      bordered
                      size="sm"
                      data-bs-theme={
                        document.documentElement.dataset['bsTheme'] === 'light'
                          ? 'dark'
                          : 'light'
                      }
                    >
                      <tbody>
                        {Object.entries(tags).map(([key, value]) => (
                          <tr key={key}>
                            <th>{key}</th>
                            <td>{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  }
                >
                  {({ props }) => {
                    const next =
                      activeIndex > -1
                        ? activeObjects.toSpliced(activeIndex, 1)
                        : [...activeObjects, ts.join(',')];

                    return (
                      <a
                        className={clsx(
                          'px-2 rounded',
                          activeIndex > -1
                            ? 'bg-primary text-light'
                            : 'bg-body-secondary',
                        )}
                        href={'/#objects=' + encodeURIComponent(next.join(';'))}
                        onClick={(e) => {
                          e.preventDefault();

                          dispatch(objectsSetFilter(next));
                        }}
                        {...props}
                      >
                        {strippedName(name) || '???'}
                      </a>
                    );
                  }}
                </LongPressTooltip>
              );
            })}
          </div>
        </Fragment>
      ))}
    </div>
  );
}
