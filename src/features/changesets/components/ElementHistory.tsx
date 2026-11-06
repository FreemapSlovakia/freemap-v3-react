import { encodePanel } from '@app/url/panelParam.js';
import { setUrlUpdatingEnabled } from '@app/url/urlUpdating.js';
import { Text } from '@features/l10n/Text.js';
import { getOsmChangesetUrl } from '@features/openInExternalApp/externalUrlUtils.js';
import { usePaged } from '@shared/components/LoadMoreSentinel.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { inAppLink } from '@shared/inAppLink.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { OsmFeatureId } from '@shared/types/featureId.js';
import type { ReactElement } from 'react';
import { Spinner } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { changesetsInspect, type HistoryVersion } from '../model/actions.js';
import { osmIdKey } from '../model/changesetDiff.js';
import { changesetElementSelect } from '../model/inspection.js';
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
    // One history entry for both steps: the selection writes it.
    setUrlUpdatingEnabled(false);

    try {
      dispatch(changesetsInspect(changeset, { fromHistory: true }));
    } finally {
      setUrlUpdatingEnabled(true);
    }

    // Its element selected, as a click on the map does, so the inspector's
    // panel takes the drill over from its details'.
    dispatch(changesetElementSelect({ type: id.elementType, id: id.id }));

    trackMatomo(['trackEvent', 'Changesets', 'inspect', 'history']);
  };

  if (error !== undefined) {
    return <Text m={cm}>{(cm) => cm.history.error({ err: error })}</Text>;
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
              <a
                {...(window.fmEmbedded
                  ? {
                      href: getOsmChangesetUrl(version.changeset),
                      target: '_blank',
                      rel: 'noopener noreferrer',
                    }
                  : inAppLink(
                      // As the click: the changeset, at this element.
                      `#panel=${encodePanel({
                        type: 'changeset',
                        id: version.changeset,
                        element: osmIdKey(id),
                      })}`,
                      () => inspect(version.changeset),
                    ))}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ul>

      {more}
    </>
  );
}
