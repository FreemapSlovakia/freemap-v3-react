import { mapRefocus } from 'fm3/actions/mapActions';
import { objectsSetFilter } from 'fm3/actions/objectsActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { useScrollClasses } from 'fm3/hooks/scrollClassesHook';
import { useMessages } from 'fm3/l10nInjector';
import { poiTypeGroups, poiTypes } from 'fm3/poiTypes';
import {
  ChangeEvent,
  Fragment,
  ReactElement,
  useCallback,
  useRef,
  useState,
} from 'react';
import Dropdown, { DropdownProps } from 'react-bootstrap/Dropdown';
import FormControl from 'react-bootstrap/FormControl';
import { useDispatch, useSelector } from 'react-redux';
import { HideArrow } from './SearchMenu';

export function ObjectsMenu(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const zoom = useSelector((state) => state.map.zoom);

  const [filter, setFilter] = useState('');

  const [dropdownOpened, setDropdownOpened] = useState(false);

  const handleFilterSet = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFilter(e.currentTarget.value);
  }, []);

  const handleSelect = useCallback(
    (id: string | null) => {
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
      } else if (id !== null) {
        dispatch(objectsSetFilter(Number(id)));

        setDropdownOpened(false);
        setFilter('');
      }
    },
    [zoom, dispatch],
  );

  // ugly hack not to close dropdown on open
  const justOpenedRef = useRef(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleToggle: DropdownProps['onToggle'] = (isOpen, e) => {
    if (justOpenedRef.current) {
      justOpenedRef.current = false;
    } else if (!isOpen) {
      setDropdownOpened(false);

      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      inputRef.current?.blur();
    }
  };

  const sc = useScrollClasses('vertical');

  return (
    <>
      <Dropdown
        className="ml-1"
        id="objectsMenuDropdown"
        show={dropdownOpened}
        onSelect={handleSelect}
        onToggle={handleToggle}
      >
        <Dropdown.Toggle as={HideArrow}>
          <FormControl
            type="text"
            placeholder={m?.objects.type}
            onChange={handleFilterSet}
            value={filter}
            onFocus={() => {
              justOpenedRef.current = true;
              setDropdownOpened(true);
            }}
            ref={inputRef}
          />
        </Dropdown.Toggle>
        <Dropdown.Menu
          popperConfig={{
            strategy: 'fixed',
          }}
        >
          <div className="dropdown-long" ref={sc}>
            <div />

            {poiTypeGroups.map((pointTypeGroup, i) => {
              const gid = pointTypeGroup.id;

              const items = poiTypes
                .filter(({ group }) => group === gid)
                .filter(({ id }) =>
                  m?.objects.subcategories[id]
                    ?.toLowerCase()
                    .includes(filter.toLowerCase()),
                )
                .map(({ group, id, icon }) => (
                  <Dropdown.Item key={id} eventKey={String(id)}>
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
                  <Dropdown.Header>
                    {m?.objects.categories[gid]}
                  </Dropdown.Header>
                  {items}
                </Fragment>
              );
            })}
          </div>
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
}
