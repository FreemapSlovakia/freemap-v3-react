import {
  type ElevationReading,
  ElevationValue,
  hasElevationLine,
} from '@features/elevationChart/components/ElevationValue.js';
import { getOsmElementUrl } from '@features/openInExternalApp/externalUrlUtils.js';
import type { SearchResult } from '@features/search/model/actions.js';
import { resultCoords } from '@features/search/model/resultUtils.js';
import {
  getNameFromOsmElement,
  resolveGenericName,
} from '@osm/osmNameResolver.js';
import { osmTagToIconMapping } from '@osm/osmTagToIconMapping.js';
import { useGenericNameParts } from '@osm/useGenericNameResolver.js';
import { IconGlyph } from '@shared/components/IconGlyph.js';
import { OsmTagKey, OsmTagValue } from '@shared/components/OsmTagLinks.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import {
  OsmFeatureIdSchema,
  stringifyFeatureId,
} from '@shared/types/featureId.js';
import { type ReactElement, useState } from 'react';
import { Table } from 'react-bootstrap';
import { hasTerrainValues, type TerrainFacts } from '../model/terrainFacts.js';
import { useObjectsMessages } from '../translations/useObjectsMessages.js';
import { GenericNameToggles } from './GenericNameToggles.js';
import { SourceName } from './SourceName.js';
import { TerrainFactsView } from './TerrainFactsView.js';
import { TerrainPointOffset } from './TerrainPointOffset.js';

type Props = {
  result: SearchResult;
  elevation: ElevationReading;
  terrain: TerrainFacts | null;
  atTerrainPoint: boolean;
};

export function ObjectDetails({
  result,
  elevation,
  terrain,
  atTerrainPoint,
}: Props): ReactElement {
  const { id, geojson } = result;

  const genericNameParts = useGenericNameParts(result);

  const imgs = resolveGenericName(
    osmTagToIconMapping,
    geojson.properties ?? {},
  );

  const language = useAppSelector((state) => state.l10n.language);

  const displayName =
    result.displayName ||
    getNameFromOsmElement(geojson.properties ?? {}, language);

  const parsedId = OsmFeatureIdSchema.safeParse(id);

  const om = useObjectsMessages();

  const facts = parsedId.success && terrain ? terrain : null;

  const showFacts = facts !== null && hasTerrainValues(facts);

  const inBracket = atTerrainPoint && showFacts;

  // Named for where it was read: a node is often off its summit. Left out where
  // `ElevationValue` renders nothing, so no empty margin is left.
  const elevationLine = hasElevationLine(elevation) && (
    <div key="elevation" className={showFacts ? undefined : 'mb-3'}>
      <ElevationValue
        {...elevation}
        // The bracket's ⓘ credits it instead.
        attributions={inBracket ? [] : elevation.attributions}
        label={
          !atTerrainPoint || !facts
            ? om?.elevation
            : facts.kind === 'peak'
              ? om?.terrain.summitElevation
              : om?.terrain.saddleElevation
        }
        offer={!atTerrainPoint}
      />

      {atTerrainPoint && facts && parsedId.success && (
        <TerrainPointOffset
          facts={facts}
          osmId={parsedId.data.id}
          marker={resultCoords(result)}
        />
      )}
    </div>
  );

  // Not only OSM tags land here: other sources' values can be numbers or objects.
  const properties = Object.entries(geojson.properties ?? {})
    .filter(([k, v]) => k !== 'display_name' && v != null)
    .map(([k, v]): [string, string] => [
      k,
      typeof v === 'string' ? v : JSON.stringify(v),
    ]);

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
    <>
      {/* One wrapping row rather than running text: an inline-flex box of chips
          is atomic, so it would drop whole to the next line the moment it no
          longer fitted beside the icon. */}
      <p className="lead d-flex flex-wrap gap-2 align-items-baseline">
        {imgs.map((img) => (
          <IconGlyph key={img} poi={img} />
        ))}

        {/* Named first, kind of thing second — as the search list reads. */}
        {displayName && <span className="fw-semibold">{displayName}</span>}

        <GenericNameToggles
          // Whether its other categories are expanded is per object.
          key={stringifyFeatureId(id)}
          parts={genericNameParts}
          tags={geojson.properties ?? undefined}
        />
      </p>

      {/* Under the facts' own ⓘ where they come with it, from the same service. */}
      {!inBracket && elevationLine}

      {showFacts && parsedId.success && (
        <div className="mb-3">
          <TerrainFactsView
            facts={facts}
            osmId={parsedId.data.id}
            name={displayName}
            elevationRow={inBracket && elevationLine}
          />
        </div>
      )}

      {/* An embed has no selection toolbar, so its ⋮ menu can't carry these. */}
      {window.fmEmbedded && parsedId.success && (
        <p>
          <a
            target="_blank"
            rel="noreferrer"
            href={getOsmElementUrl(parsedId.data)}
          >
            {om?.openInOsm}
          </a>
          {' ('}
          <a
            target="_blank"
            rel="noreferrer"
            href={getOsmElementUrl(parsedId.data, true)}
          >
            {om?.osmHistory}
          </a>
          )
        </p>
      )}

      {parsedId.success && geojson.properties?.['description'] && (
        <p>{geojson.properties['description']}</p>
      )}

      {geojson.properties && (
        // The toast shrinks to fit; widened to its cap, the width measured
        // doesn't depend on the layout chosen.
        <div ref={tableRef} style={{ width: '100vw', maxWidth: '100%' }}>
          <Table striped bordered size="sm" responsive>
            <tbody>
              {properties.map(([k, v]) =>
                stacked ? (
                  <tr key={k}>
                    <td>
                      <div className="fw-bold">
                        <PropertyKey tag={k} osm={parsedId.success} />
                      </div>

                      <PropertyValue tag={k} value={v} osm={parsedId.success} />
                    </td>
                  </tr>
                ) : (
                  <tr key={k}>
                    <th>
                      <PropertyKey tag={k} osm={parsedId.success} />
                    </th>

                    <td>
                      <PropertyValue tag={k} value={v} osm={parsedId.success} />
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </Table>
        </div>
      )}

      <span>
        {om?.source}: <SourceName result={result} />
      </span>
    </>
  );
}

/** A key at its unwrapped width, which the layout decision measures. */
function PropertyKey({ tag, osm }: { tag: string; osm: boolean }) {
  return (
    <span data-key className="d-inline-block text-nowrap">
      <OsmTagKey tag={tag} osm={osm} />
    </span>
  );
}

/** Mid-word breaks only for unbroken values. */
function PropertyValue({
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
