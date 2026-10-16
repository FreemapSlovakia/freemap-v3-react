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
import { OsmTagsTable } from '@shared/components/OsmTagsTable.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import {
  OsmFeatureIdSchema,
  stringifyFeatureId,
} from '@shared/types/featureId.js';
import type { ReactElement } from 'react';
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
        <OsmTagsTable tags={properties} osm={parsedId.success} />
      )}

      <span>
        {om?.source}: <SourceName result={result} />
      </span>
    </>
  );
}
