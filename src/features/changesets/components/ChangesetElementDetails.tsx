import { OsmTagKey, OsmTagValue } from '@shared/components/OsmTagLinks.js';
import type { CSSProperties, ReactElement } from 'react';
import { AlertLink, Table } from 'react-bootstrap';
import {
  DIFF_COLORS,
  type DiffElement,
  hasMoved,
  isIndirect,
} from '../model/changesetDiff.js';
import { useChangesetsMessages } from '../translations/useChangesetsMessages.js';
import { useElementName } from './useElementName.js';

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

  const { label } = useElementName();

  const oldMembers = new Set(element.old?.members);

  const newMembers = new Set(element.new?.members);

  const addedMembers = newMembers.difference(oldMembers).size;

  const removedMembers = oldMembers.difference(newMembers).size;

  return (
    <>
      <p className="mb-2">
        <b>{label(element)}</b>{' '}
        <span style={{ color: DIFF_COLORS[element.action] }}>
          {cm?.actions[element.action]}
        </span>{' '}
        <small>
          {element.old && `v${element.old.version}`}
          {element.old && element.new && ' → '}
          {element.new && `v${element.new.version}`}
        </small>
      </p>

      {element.action === 'modify' &&
        (isIndirect(element) ? (
          <p className="mb-2">{cm?.element.onlyNodesMoved}</p>
        ) : (
          <>
            {hasMoved(element) && (
              <p className="mb-2">{cm?.element.geometryChanged}</p>
            )}

            {(addedMembers > 0 || removedMembers > 0) && (
              <p className="mb-2">
                {cm?.element.members({
                  added: addedMembers,
                  removed: removedMembers,
                })}
              </p>
            )}
          </>
        ))}

      {rows.length > 0 &&
        (element.action === 'modify' && !tagsChanged ? (
          <p className="mb-2">{cm?.element.tagsUnchanged}</p>
        ) : (
          <Table size="sm" className="mb-2">
            <thead>
              <tr className="text-nowrap">
                <th>{cm?.element.key}</th>
                {element.old && element.new ? (
                  <>
                    <th>{cm?.element.before}</th>
                    <th>{cm?.element.after}</th>
                  </>
                ) : (
                  <th>{cm?.element.value}</th>
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
        {cm?.element.history}
      </AlertLink>
    </>
  );
}
