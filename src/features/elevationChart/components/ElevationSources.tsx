import type { AttributionDef } from '@shared/mapDefinitions.js';
import { Fragment, type ReactElement, type ReactNode } from 'react';
import { useElevationChartMessages } from '../translations/useElevationChartMessages.js';

type Props = { sources: AttributionDef[] };

// One dataset can be credited under one name with several links.
const keyOf = (attr: AttributionDef) => `${attr.name} ${attr.url ?? ''}`;

/* A model we have no link for is still named, just not as a link. */
function SourceName({ attr }: { attr: AttributionDef }): ReactNode {
  return attr.url ? (
    <a
      href={attr.url}
      target="_blank"
      rel="noopener noreferrer"
      className="link-body-emphasis"
    >
      {attr.name}
    </a>
  ) : (
    attr.name
  );
}

/** The credits as one comma-separated run, for a footer or a tooltip line. */
export function ElevationSourcesInline({ sources }: Props): ReactElement {
  return (
    <>
      {sources.map((attr, i) => (
        <Fragment key={keyOf(attr)}>
          {i > 0 ? ', ' : null}

          <SourceName attr={attr} />
        </Fragment>
      ))}
    </>
  );
}

/** Every credit, one per line — what the toast shows when there are too many. */
export function ElevationSourcesList({ sources }: Props): ReactElement {
  const m = useElevationChartMessages();

  return (
    <>
      {m?.elevationSource}:
      <ul className="ps-4 mb-0">
        {sources.map((attr) => (
          <li key={keyOf(attr)}>
            <SourceName attr={attr} />
          </li>
        ))}
      </ul>
    </>
  );
}
