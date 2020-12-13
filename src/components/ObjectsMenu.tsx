import { convertToDrawing } from 'fm3/actions/mainActions';
import { mapRefocus } from 'fm3/actions/mapActions';
import { objectsSetFilter } from 'fm3/actions/objectsActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { useMessages } from 'fm3/l10nInjector';
import { poiTypeGroups, poiTypes } from 'fm3/poiTypes';
import { RootState } from 'fm3/storeCreator';
import {
  ChangeEvent,
  Fragment,
  ReactElement,
  useCallback,
  useState,
} from 'react';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import FormControl from 'react-bootstrap/FormControl';
import { useDispatch, useSelector } from 'react-redux';

export function ObjectsMenu(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const zoom = useSelector((state: RootState) => state.map.zoom);

  const hasObjects = useSelector(
    (state: RootState) => state.objects.objects.length > 0,
  );

  const [filter, setFilter] = useState('');

  const [dropdownOpened, setDropdownOpened] = useState(false);

  const handleFilterSet = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFilter(e.currentTarget.value);
  }, []);

  const handleToggle = useCallback(() => {
    setDropdownOpened(!dropdownOpened);
  }, [dropdownOpened]);

  const handleSelect = useCallback(
    (id: unknown) => {
      if (zoom < 12) {
        dispatch(
          toastsAdd({
            id: 'objects.lowZoomAlert',
            messageKey: 'objects.lowZoomAlert.message',
            style: 'warning',
            actions: [
              {
                // name: 'Priblíž a hľadaj', TODO
                nameKey: 'objects.lowZoomAlert.zoom',
                action: [mapRefocus({ zoom: 12 })],
              },
            ],
          }),
        );
      } else if (typeof id === 'number') {
        dispatch(objectsSetFilter(id));
      }
    },
    [zoom, dispatch],
  );

  return (
    <>
      <Dropdown
        className="dropdown-long"
        id="objectsMenuDropdown"
        onToggle={handleToggle}
        show={dropdownOpened}
      >
        <FormControl
          type="text"
          placeholder={m?.objects.type}
          onChange={handleFilterSet}
          value={filter}
        />
        <Dropdown.Menu>
          {poiTypeGroups.map((pointTypeGroup, i) => {
            const gid = pointTypeGroup.id;

            const items = poiTypes
              .filter(({ group }) => group === gid)
              .filter(
                ({ id }) =>
                  m?.objects.subcategories[id]
                    ?.toLowerCase()
                    .indexOf(filter.toLowerCase()) !== -1,
              )
              .map(({ group, id, icon }) => (
                <Dropdown.Item
                  key={id}
                  eventKey={String(id)}
                  onSelect={handleSelect}
                >
                  <img
                    src={require(`../images/mapIcons/${icon}.png`)}
                    alt={`${group}-${icon}`}
                  />{' '}
                  {m?.objects.subcategories[id]}
                </Dropdown.Item>
              ));

            return items.length === 0 ? null : (
              <Fragment key={gid}>
                {i > 0 && <Dropdown.Divider />}
                <Dropdown.Header>{m?.objects.categories[gid]}</Dropdown.Header>
                {items}
              </Fragment>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
      <Button
        className="ml-1"
        onClick={() => {
          dispatch(convertToDrawing(undefined));
        }}
        disabled={!hasObjects}
        title={m?.general.convertToDrawing}
      >
        <FontAwesomeIcon icon="pencil" />
        <span className="d-none d-sm-inline">
          {' '}
          {m?.general.convertToDrawing}
        </span>
      </Button>
    </>
  );
}
