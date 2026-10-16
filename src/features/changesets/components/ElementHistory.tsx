import { getOsmChangesetUrl } from '@features/openInExternalApp/externalUrlUtils.js';
import { usePaged } from '@shared/components/LoadMoreSentinel.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { inAppLink } from '@shared/inAppLink.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { OsmFeatureId } from '@shared/types/featureId.js';
import type { ReactElement } from 'react';
import { AlertLink, Spinner } from 'react-bootstrap';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { changesetsInspect, type HistoryVersion } from '../model/actions.js';
import { changesetElementSelect } from '../model/inspectorToast.js';
import { useChangesetsMessages } from '../translations/useChangesetsMessages.js';

const PAGE_ROWS = 100;

type Props = {
  id: OsmFeatureId;
  /** As `changesetsHistoryProcessor` reads them; neither while it does. */
  versions: HistoryVersion[] | undefined;
  error: string | undefined;
};

/** The element's versions, newest first; each inspects its changeset. */
export function ElementHistory({ id, versions, error }: Props): ReactElement {
  const cm = useChangesetsMessages();

  const dispatch = useDispatch();

  const { shown, more } = usePaged(versions ?? [], PAGE_ROWS);

  const dateFormat = useDateTimeFormat({
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const inspect = (changeset: number) => {
    dispatch(changesetsInspect(changeset, { fromHistory: true }));

    // Its element selected, as a click on the map does, so the inspector's
    // toast takes the drill over from its details.
    dispatch(changesetElementSelect({ type: id.elementType, id: id.id }));

    trackMatomo(['trackEvent', 'Changesets', 'inspect', 'history']);
  };

  if (error !== undefined) {
    return <>{cm?.history.error({ err: error })}</>;
  }

  if (!versions) {
    return <Spinner animation="border" size="sm" />;
  }

  return (
    <>
      <ul className="list-unstyled mb-0">
        {shown.map((version) => {
          const label = version.comment ?? `#${version.changeset}`;

          return (
            <li key={version.version} className="mb-1">
              <small>
                v{version.version} ·{' '}
                {dateFormat.format(new Date(version.timestamp))}
                {version.user && ` · ${version.user}`}
              </small>

              <br />

              {/* An embed inspects nothing, so goes to osm.org. */}
              <AlertLink
                {...(window.fmEmbedded
                  ? {
                      href: getOsmChangesetUrl(version.changeset),
                      target: '_blank',
                      rel: 'noopener noreferrer',
                    }
                  : inAppLink(`#changeset=${version.changeset}`, () =>
                      inspect(version.changeset),
                    ))}
              >
                {label} {window.fmEmbedded && <FaExternalLinkAlt />}
              </AlertLink>
            </li>
          );
        })}
      </ul>

      {more}
    </>
  );
}
