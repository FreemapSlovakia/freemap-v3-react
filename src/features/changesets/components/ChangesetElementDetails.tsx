import { Text } from '@features/l10n/Text.js';
import { OsmTagKey, OsmTagValue } from '@shared/components/OsmTagLinks.js';
import { inAppLink } from '@shared/inAppLink.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { CSSProperties, ReactElement } from 'react';
import { AlertLink, Table } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  DIFF_COLORS,
  type DiffElement,
  hasMoved,
  isIndirect,
} from '../model/changesetDiff.js';
import { changesetElementOpen } from '../model/inspectorToast.js';
import { useChangesetsMessages } from '../translations/useChangesetsMessages.js';
import { ElementTypeIcon } from './ElementTypeIcon.js';

type Props = { element: DiffElement };

// Unlike `text-break`, breaks a word only where nothing else fits, so it
// doesn't narrow the column to a few letters.
const VALUE_STYLE: CSSProperties = { overflowWrap: 'break-word' };

const ROW_CLASS = {
  added: 'table-success',
  removed: 'table-danger',
  changed: 'table-warning',
  same: undefined,
};

export function ChangesetElementDetails({ element }: Props): ReactElement {
  const cm = useChangesetsMessages();

  const oldTags = element.old?.tags ?? {};

  const newTags = element.new?.tags ?? {};

  const rows = [...new Set([...Object.keys(oldTags), ...Object.keys(newTags)])]
    .toSorted()
    .map((key) => {
      const before = Object.hasOwn(oldTags, key) ? oldTags[key] : undefined;

      const after = Object.hasOwn(newTags, key) ? newTags[key] : undefined;

      const change =
        before === undefined
          ? 'added'
          : after === undefined
            ? 'removed'
            : before === after
              ? 'same'
              : 'changed';

      return { key, before, after, change } as const;
    });

  const tagsChanged = rows.some((row) => row.change !== 'same');

  const oldMembers = new Set(element.old?.members);

  const newMembers = new Set(element.new?.members);

  const addedMembers = newMembers.difference(oldMembers).size;

  const removedMembers = oldMembers.difference(newMembers).size;

  const dispatch = useDispatch();

  return (
    <>
      {/* Named by the breadcrumb above, as the panel lists it; here what it
          is in OSM. */}
      <p className="mb-2">
        <ElementTypeIcon element={element} />{' '}
        {element.action === 'delete' ? (
          // No more, so nothing to open.
          element.id
        ) : (
          <AlertLink
            {...inAppLink(`#osm-${element.type}=${element.id}`, () => {
              for (const action of changesetElementOpen(element)) {
                dispatch(action);
              }

              trackMatomo(['trackEvent', 'Changesets', 'openElement']);
            })}
          >
            {element.id}
          </AlertLink>
        )}{' '}
        ·{' '}
        <span style={{ color: DIFF_COLORS[element.action] }}>
          <Text m={cm} k={`actions.${element.action}`} />
        </span>{' '}
        <small>
          {element.old && `v${element.old.version}`}
          {element.old && element.new && ' → '}
          {element.new && `v${element.new.version}`}
        </small>
      </p>

      {element.action === 'modify' &&
        (isIndirect(element) ? (
          <p className="mb-2">
            <Text m={cm} k="element.onlyNodesMoved" />
          </p>
        ) : (
          <>
            {hasMoved(element) && (
              <p className="mb-2">
                <Text m={cm} k="element.geometryChanged" />
              </p>
            )}

            {(addedMembers > 0 || removedMembers > 0) && (
              <p className="mb-2">
                <Text m={cm}>
                  {(cm) =>
                    cm.element.members({
                      added: addedMembers,
                      removed: removedMembers,
                    })
                  }
                </Text>
              </p>
            )}
          </>
        ))}

      {rows.length > 0 &&
        (element.action === 'modify' && !tagsChanged ? (
          <p className="mb-2">
            <Text m={cm} k="element.tagsUnchanged" />
          </p>
        ) : (
          <Table size="sm" className="mb-2">
            <thead>
              <tr className="text-nowrap">
                <th>
                  <Text m={cm} k="element.key" />
                </th>
                {element.old && element.new ? (
                  <>
                    <th>
                      <Text m={cm} k="element.before" />
                    </th>
                    <th>
                      <Text m={cm} k="element.after" />
                    </th>
                  </>
                ) : (
                  <th>
                    <Text m={cm} k="element.value" />
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className={ROW_CLASS[row.change]}>
                  <td className="text-nowrap">
                    <OsmTagKey tag={row.key} osm />
                  </td>
                  {element.old && (
                    <td style={VALUE_STYLE}>
                      {row.before !== undefined && (
                        <OsmTagValue tag={row.key} value={row.before} osm />
                      )}
                    </td>
                  )}
                  {element.new && (
                    <td style={VALUE_STYLE}>
                      {row.after !== undefined && (
                        <OsmTagValue tag={row.key} value={row.after} osm />
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        ))}

      <AlertLink
        href={`https://www.openstreetmap.org/${element.type}/${element.id}/history`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Text m={cm} k="element.history" />
      </AlertLink>
    </>
  );
}
