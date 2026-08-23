import { convertToDrawing } from '@app/store/actions.js';
import { useConvertToDataViewer } from '@features/dataViewer/hooks/useConvertToDataViewer.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import type { SelectCallback } from '@restart/ui/types';
import {
  Action,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
import type { ReactElement, ReactNode } from 'react';
import { FaPencilAlt, FaSearch } from 'react-icons/fa';
import { MdShapeLine } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import type { ObjectsResult } from '../model/actions.js';
import { objectsShowAsLookup } from '../model/actions.js';
import { useObjectsMessages } from '../translations/useObjectsMessages.js';

type Props = {
  /** The one object to act on. Absent acts on every visible object. */
  object?: ObjectsResult;
  /** Further `Action`s for the same menu — what the one object can do. */
  children?: ReactNode;
  onSelect?: SelectCallback;
};

/**
 * What can be made of an object somewhere else — a drawing, loaded data, a
 * lookup. Shared by
 * the selection toolbar and the tool's own, so that acting on one object and
 * acting on all of them are the same gesture, and the next thing they can
 * become is added once.
 *
 * Acting on all of them hands them over for good, so it "converts"; one object
 * stays where it is, so it is copied. Converting with full geometry is offered
 * for a single object only: doing it for a whole screenful would be an OSM
 * request per object.
 */
export function ObjectsConvertMenu({
  object,
  children,
  onSelect,
}: Props): ReactElement {
  const m = useMessages();

  const om = useObjectsMessages();

  const dispatch = useDispatch();

  const convertToDataViewer = useConvertToDataViewer();

  const id = object?.id;

  return (
    <ResponsiveActions onSelect={onSelect} toggleLabel={m?.general.actions}>
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

      <Action
        icon={<MdShapeLine />}
        label={(object ? m?.general.copyTo : m?.general.convertTo)?.({
          tool: m?.tools.dataViewer,
        })}
        onClick={() => {
          convertToDataViewer({ type: 'objects', id });
        }}
        showFrom="never"
      />

      {id && id.elementType !== 'node' && (
        <Action
          icon={<MdShapeLine />}
          label={om?.convertWithGeometryTo({ tool: m?.tools.dataViewer })}
          onClick={() => {
            convertToDataViewer({ type: 'objects-geometry', id });
          }}
          showFrom="never"
        />
      )}

      <Action
        icon={<FaSearch />}
        label={om?.showAsLookup}
        onClick={() => {
          dispatch(objectsShowAsLookup({ id }));
        }}
        showFrom="never"
      />

      {children}
    </ResponsiveActions>
  );
}
