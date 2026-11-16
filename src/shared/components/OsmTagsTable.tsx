import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { OsmTagKey, OsmTagValue } from '@shared/components/OsmTagLinks.js';
import clsx from 'clsx';
import { type ReactElement, useState } from 'react';
import { Table } from 'react-bootstrap';

/** Readable names for keys and values; `undefined` leaves the raw one. */
export type TagLabeler = {
  key: (tag: string) => string | undefined;
  value: (tag: string, value: string) => string | undefined;
  /** Whether the key's values come from a fixed list, so an unnamed one is raw. */
  isEnum: (tag: string) => boolean;
};

type Props = {
  tags: [string, string][];
  /** Whether the tags are OSM ones, linked to what documents them. */
  osm: boolean;
  labels?: TagLabeler;
};

/** Key/value rows, each value under its key where the toast is too narrow. */
export function OsmTagsTable({ tags, osm, labels }: Props): ReactElement {
  const [stacked, setStacked] = useState(false);

  // When the widest key leaves the values less than they need (up to 10rem),
  // the whole table puts each value below its key. Both are measured the same
  // in either layout; the table is observed too, so new content is measured.
  const tableRef = (el: HTMLDivElement | null) => {
    if (!el) {
      return;
    }

    const widest = (selector: string) =>
      Math.max(
        0,
        ...[...el.querySelectorAll<HTMLElement>(selector)].map(
          (e) => e.offsetWidth,
        ),
      );

    const check = () => {
      const values = [...el.querySelectorAll<HTMLElement>('[data-value]')];

      // Unwrapped only while read, within one task, so it never paints.
      for (const value of values) {
        value.style.width = 'max-content';
      }

      const valueWidth = widest('[data-value]');

      for (const value of values) {
        value.style.width = '';
      }

      const rem = parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );

      // 1.25rem for the cells' padding and borders. Not flushSync: re-rendering
      // inside the callback resizes what's observed, a ResizeObserver loop error.
      setStacked(
        widest('[data-key]') + Math.min(valueWidth, 10 * rem) + 1.25 * rem >
          el.clientWidth,
      );
    };

    const observer = new ResizeObserver(check);

    observer.observe(el);

    const table = el.querySelector('table');

    if (table) {
      observer.observe(table);
    }

    return () => observer.disconnect();
  };

  return (
    // At its cap, so the width measured doesn't depend on the layout chosen.
    <div
      ref={tableRef}
      className="mb-3"
      style={{ width: '100vw', maxWidth: '100%' }}
    >
      <Table striped bordered size="sm" responsive className="mb-0">
        <tbody>
          {tags.map(([k, v]) =>
            stacked ? (
              <tr key={k}>
                <td>
                  <div className="fw-bold">
                    <TagKey tag={k} osm={osm} labels={labels} />
                  </div>

                  <TagValue tag={k} value={v} osm={osm} labels={labels} />
                </td>
              </tr>
            ) : (
              <tr key={k}>
                <th>
                  <TagKey tag={k} osm={osm} labels={labels} />
                </th>

                <td>
                  <TagValue tag={k} value={v} osm={osm} labels={labels} />
                </td>
              </tr>
            ),
          )}
        </tbody>
      </Table>
    </div>
  );
}

type CellProps = { tag: string; osm: boolean; labels?: TagLabeler };

/**
 * A key at its unwrapped width, which the layout decision measures. A readable
 * name tells its raw key in a tooltip; among names, a raw key is monospaced.
 */
function TagKey({ tag, osm, labels }: CellProps) {
  const label = labels?.key(tag);

  return label === undefined ? (
    <span
      data-key
      className={clsx('d-inline-block text-nowrap', labels && 'font-monospace')}
    >
      <OsmTagKey tag={tag} osm={osm} />
    </span>
  ) : (
    <LongPressTooltip label={tag}>
      {({ props }) => (
        <span data-key className="d-inline-block text-nowrap" {...props}>
          <OsmTagKey tag={tag} osm={osm} label={label} />
        </span>
      )}
    </LongPressTooltip>
  );
}

/** Mid-word breaks only for unbroken values. */
function TagValue({ tag, value, osm, labels }: CellProps & { value: string }) {
  return (
    <div data-value className="text-break">
      <OsmTagValue
        tag={tag}
        value={value}
        osm={osm}
        label={labels && ((part) => labels.value(tag, part))}
        markRaw={labels?.isEnum(tag)}
      />
    </div>
  );
}
