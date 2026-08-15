import { convertToDrawing } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import type { ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
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
 * Converting with full geometry is offered for a single object only: doing it
 * for a whole screenful would be an OSM request per object.
 */
export function ObjectsConvertMenu({ object }: Props): ReactElement {
  const m = useMessages();

  const om = useObjectsMessages();

  const dispatch = useDispatch();

  const id = object?.id;

  const convertToPoint = () =>
    dispatch(convertToDrawing({ type: 'objects', id }));

  const showAsLookup = () => dispatch(objectsShowAsLookup({ id }));

  // Named by what it acts on — this object, or all of them — because that is
  // what tells the two menus apart; they hold the same actions otherwise, and
  // the toolbar each sits in says nothing about scope on its own.
  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="secondary"
        // Both toolbars are on screen whenever an object is selected while the
        // tool is open, and the menu points its `aria-labelledby` here.
        id={object ? 'objects-convert-one' : 'objects-convert-all'}
      >
        {object ? om?.thisObject : om?.allVisible}
      </Dropdown.Toggle>

      <FmDropdownMenu>
        <Dropdown.Item as="button" onClick={convertToPoint}>
          <FaPencilAlt /> {m?.general.convertToDrawing}
        </Dropdown.Item>

        {id && id.elementType !== 'node' && (
          <Dropdown.Item
            as="button"
            onClick={() => {
              dispatch(convertToDrawing({ type: 'objects-geometry', id }));
            }}
          >
            <FaPencilAlt /> {om?.convertWithGeometry}
          </Dropdown.Item>
        )}

        <Dropdown.Divider />

        <Dropdown.Item as="button" onClick={showAsLookup}>
          <FaSearch /> {om?.showAsLookup}
        </Dropdown.Item>
      </FmDropdownMenu>
    </Dropdown>
  );
}
