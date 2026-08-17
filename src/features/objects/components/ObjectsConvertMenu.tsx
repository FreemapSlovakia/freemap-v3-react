import { convertToDrawing } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  Action,
  ActionDivider,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
import type { ReactElement } from 'react';
import { FaPencilAlt, FaSearch } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import type { ObjectsResult } from '../model/actions.js';
import { objectsShowAsLookup } from '../model/actions.js';
import { useObjectsMessages } from '../translations/useObjectsMessages.js';

type Props = {
  /** The one object to act on. Absent acts on every visible object. */
  object?: ObjectsResult;
};

/**
 * What can be made of an object somewhere else — a drawing, a lookup. Shared by
 * the selection toolbar and the tool's own, so that acting on one object and
 * acting on all of them are the same gesture, and the next thing they can
 * become is added once.
 *
 * Acting on all of them hands them over for good, so it "converts"; one object
 * stays where it is, so it is copied. Converting with full geometry is offered
 * for a single object only: doing it for a whole screenful would be an OSM
 * request per object.
 */
export function ObjectsConvertMenu({ object }: Props): ReactElement {
  const m = useMessages();

  const om = useObjectsMessages();

  const dispatch = useDispatch();

  const id = object?.id;

  return (
    <ResponsiveActions>
      <Action
        icon={<FaPencilAlt />}
        label={object ? m?.general.copyToDrawing : m?.general.convertToDrawing}
        onClick={() => {
          dispatch(convertToDrawing({ type: 'objects', id }));
        }}
        showFrom="never"
      />

      {id && id.elementType !== 'node' && (
        <Action
          icon={<FaPencilAlt />}
          label={om?.convertWithGeometry}
          onClick={() => {
            dispatch(convertToDrawing({ type: 'objects-geometry', id }));
          }}
          showFrom="never"
        />
      )}

      <ActionDivider />

      <Action
        icon={<FaSearch />}
        label={om?.showAsLookup}
        onClick={() => {
          dispatch(objectsShowAsLookup({ id }));
        }}
        showFrom="never"
      />
    </ResponsiveActions>
  );
}
