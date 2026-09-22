import { useMessages } from '@features/l10n/l10nInjector.js';
import type { AttributionDef } from '@shared/mapDefinitions.js';
import { Fragment, type ReactElement, type ReactNode } from 'react';
import { usePanoramaMessages } from '../translations/usePanoramaMessages.js';

type Props = {
  /** Degrees of unfolding the picture on screen was drawn with. */
  depthLift: number;
  terrain: AttributionDef[];
};

// One model can be credited under one name with several links.
const keyOf = (attr: AttributionDef) => `${attr.name} ${attr.url ?? ''}`;

// Unstyled, as the map's own attribution list is: one credit should not read as
// a different kind of thing for being a panorama's.
function SourceName({ attr }: { attr: AttributionDef }): ReactNode {
  return attr.url ? (
    <a href={attr.url} target="_blank" rel="noopener noreferrer">
      {attr.name}
    </a>
  ) : (
    attr.name
  );
}

/** What the picture shows, what it doesn't, and what it was drawn from. */
export function PanoramaAbout({ depthLift, terrain }: Props): ReactElement {
  const m = usePanoramaMessages();

  const gm = useMessages();

  return (
    <>
      <p className="mb-1">{gm?.general.terrain.bareEarth}</p>

      <p className="mb-1">{gm?.general.terrain.coverage}</p>

      <p className="mb-1">{m?.caveats.viewpoint}</p>

      {/* Of the render, not of the setting: this says what the picture on
          screen is, and a lift only staged has not drawn it yet. */}
      {depthLift > 0 && <p className="mb-1">{m?.caveats.depthLift}</p>}

      <ul className="m-0 ps-3">
        <li>
          {m?.terrainSource}:{' '}
          {terrain.map((attr, i) => (
            <Fragment key={keyOf(attr)}>
              {i > 0 ? ', ' : null}

              <SourceName attr={attr} />
            </Fragment>
          ))}
        </li>

        {/* Every name in the picture is an OSM node — the summit's own
            elevation comes from the terrain model above, but what it is called
            does not. */}
        <li>
          {m?.peakSource}:{' '}
          <a
            href="https://osm.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
          >
            {gm?.mapLayers.attr['osmData']}
          </a>
        </li>
      </ul>
    </>
  );
}
