import { OsmTagKey, OsmTagValue } from '@shared/components/OsmTagLinks.js';
import { type ReactElement, useState } from 'react';
import { Table } from 'react-bootstrap';

type Props = {
  tags: [string, string][];
  /** Whether the tags are OSM ones, linked to what documents them. */
  osm: boolean;
};

/** Key/value rows, each value under its key where the toast is too narrow. */
export function OsmTagsTable({ tags, osm }: Props): ReactElement {
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
    // The toast shrinks to fit; widened to its cap, the width measured
    // doesn't depend on the layout chosen.
    <div ref={tableRef} style={{ width: '100vw', maxWidth: '100%' }}>
      <Table striped bordered size="sm" responsive>
        <tbody>
          {tags.map(([k, v]) =>
            stacked ? (
              <tr key={k}>
                <td>
                  <div className="fw-bold">
                    <TagKey tag={k} osm={osm} />
                  </div>

                  <TagValue tag={k} value={v} osm={osm} />
                </td>
              </tr>
            ) : (
              <tr key={k}>
                <th>
                  <TagKey tag={k} osm={osm} />
                </th>

                <td>
                  <TagValue tag={k} value={v} osm={osm} />
                </td>
              </tr>
            ),
          )}
        </tbody>
      </Table>
    </div>
  );
}

/** A key at its unwrapped width, which the layout decision measures. */
function TagKey({ tag, osm }: { tag: string; osm: boolean }) {
  return (
    <span data-key className="d-inline-block text-nowrap">
      <OsmTagKey tag={tag} osm={osm} />
    </span>
  );
}

/** Mid-word breaks only for unbroken values. */
function TagValue({
  tag,
  value,
  osm,
}: {
  tag: string;
  value: string;
  osm: boolean;
}) {
  return (
    <div data-value className="text-break">
      <OsmTagValue tag={tag} value={value} osm={osm} />
    </div>
  );
}
