import {
  ChangeEvent,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { type DropdownProps, Button, Dropdown, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  MarkerType,
  objectsSetFilter,
  setSelectedIcon,
} from '../model/actions.js';
import { fixedPopperConfig } from '../../../fixedPopperConfig.js';
import { useAppSelector } from '../../../hooks/useAppSelector.js';
import { useEffectiveChosenLanguage } from '../../../hooks/useEffectiveChosenLanguage.js';
import { useScrollClasses } from '../../../hooks/useScrollClasses.js';
import { useMessages } from '../../../l10nInjector.js';
import {
  getOsmMapping,
  resolveGenericName,
} from '../../../osm/osmNameResolver.js';
import { osmTagToIconMapping } from '../../../osm/osmTagToIconMapping.js';
import { Node, OsmMapping } from '../../../osm/types.js';
import { removeAccents } from '../../../stringUtils.js';
import { HideArrow } from '../../search/components/SearchMenu.js';
import { ToolMenu } from '../../../components/ToolMenu.js';
import { FaCircle, FaMapMarker, FaSquare, FaTrash } from 'react-icons/fa';
import { LongPressTooltip } from '../../../components/LongPressTooltip.js';

export default ObjectsMenu;

export function ObjectsMenu(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const [filter, setFilter] = useState('');

  const [dropdownOpened, setDropdownOpened] = useState(false);

  const handleFilterSet = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFilter(e.currentTarget.value);
  }, []);

  const lang = useEffectiveChosenLanguage();

  const [osmMapping, setOsmMapping] = useState<OsmMapping>();

  const items = useMemo(() => {
    if (!osmMapping) {
      return;
    }

    const res: { name: string; tags: { key: string; value?: string }[] }[] = [];

    function rec(
      n: Node,
      tags: { key: string; value: string }[],
      key?: string,
    ) {
      for (const [tagKeyOrValue, nodeOrName] of Object.entries(n)) {
        if (nodeOrName === '{}') {
          continue;
        }

        if (typeof nodeOrName === 'string') {
          if (key && tagKeyOrValue === '*') {
            continue;
          }

          res.push({
            name: nodeOrName.replace('{}', '').trim(),
            tags:
              !key && tagKeyOrValue === '*'
                ? tags
                : [
                    ...tags,
                    key
                      ? { key, value: tagKeyOrValue }
                      : { key: tagKeyOrValue },
                  ],
          });
        } else if (key) {
          rec(nodeOrName, [...tags, { key, value: tagKeyOrValue }]);
        } else {
          rec(nodeOrName, tags, tagKeyOrValue);
        }
      }
    }

    rec(osmMapping.osmTagToNameMapping, []);

    return res;
  }, [osmMapping]);

  const active = useAppSelector((state) => state.objects.active);

  useEffect(() => {
    getOsmMapping(lang).then(setOsmMapping);
  }, [lang]);

  const handleSelect = useCallback(
    (tags: string | null) => {
      if (tags) {
        dispatch(
          objectsSetFilter(
            active.includes(tags)
              ? active.filter((item) => item !== tags)
              : [...active, tags],
          ),
        );
      }
    },
    [dispatch, active],
  );

  // ugly hack not to close dropdown on open
  const justOpenedRef = useRef(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleToggle: DropdownProps['onToggle'] = (nextShow, metadata) => {
    if (justOpenedRef.current) {
      justOpenedRef.current = false;
    } else if (!nextShow && metadata.source !== 'select') {
      setDropdownOpened(false);
      setFilter('');

      metadata.originalEvent?.preventDefault();

      metadata.originalEvent?.stopPropagation();

      inputRef.current?.blur();
    }
  };

  const sc = useScrollClasses('vertical');

  const normalizedFilter = removeAccents(filter.trim().toLowerCase());

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const activeSnapshot = useMemo(() => active, [dropdownOpened]);

  function makeItems(snapshot?: boolean) {
    if (!items) {
      return null;
    }

    return items
      .map((item) => ({
        ...item,
        key: item.tags.map((tag) => `${tag.key}=${tag.value}`).join(','),
      }))
      .filter(
        (item) =>
          item.name &&
          (!snapshot || activeSnapshot.includes(item.key)) &&
          (snapshot ||
            !normalizedFilter ||
            removeAccents(item.name.toLowerCase()).includes(normalizedFilter)),
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(({ key, name, tags }) => {
        const img = resolveGenericName(
          osmTagToIconMapping,
          Object.fromEntries(tags.map(({ key, value }) => [key, value ?? '*'])),
        );

        return (
          <Dropdown.Item key={key} eventKey={key} active={active.includes(key)}>
            {img.length > 0 ? (
              <img src={img[0]} style={{ width: '1em', height: '1em' }} />
            ) : (
              <span
                style={{
                  display: 'inline-block',
                  width: '1em',
                  height: '1em',
                }}
              />
            )}
            &emsp;
            {name}
          </Dropdown.Item>
        );
      });
  }

  const activeItems = makeItems(true);

  const selectedIconValue = useAppSelector(
    (state) => state.objects.selectedIcon,
  );

  const handleIconChange = (selectedIconValue: MarkerType) => {
    dispatch(setSelectedIcon(selectedIconValue));
  };

  return (
    <ToolMenu>
      <Dropdown
        className="ms-1"
        id="objectsMenuDropdown"
        show={dropdownOpened}
        onSelect={handleSelect}
        onToggle={handleToggle}
      >
        <Dropdown.Toggle as={HideArrow}>
          <Form.Control
            type="search"
            style={{ width: '8em' }}
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
          popperConfig={fixedPopperConfig}
          className="fm-dropdown-with-scroller"
        >
          <div className="dropdown-long" ref={sc}>
            <div />

            {activeItems}

            {activeItems?.length ? <Dropdown.Divider /> : null}

            {makeItems()}
          </div>
        </Dropdown.Menu>
      </Dropdown>

      <Dropdown
        className="ms-1"
        onSelect={(eventKey) => handleIconChange(eventKey as MarkerType)}
      >
        <Dropdown.Toggle variant="secondary">
          {selectedIconValue == 'ring' ? (
            <FaCircle />
          ) : selectedIconValue == 'square' ? (
            <FaSquare />
          ) : (
            <FaMapMarker />
          )}
        </Dropdown.Toggle>
        <Dropdown.Menu popperConfig={fixedPopperConfig}>
          <Dropdown.Item eventKey="pin" active={selectedIconValue === 'pin'}>
            <FaMapMarker /> {m?.objects.icon.pin}
          </Dropdown.Item>

          <Dropdown.Item eventKey="ring" active={selectedIconValue === 'ring'}>
            <FaCircle /> {m?.objects.icon.ring}
          </Dropdown.Item>

          <Dropdown.Item
            eventKey="square"
            active={selectedIconValue === 'square'}
          >
            <FaSquare /> {m?.objects.icon.square}
          </Dropdown.Item>
        </Dropdown.Menu>

        {active.length > 0 && (
          <LongPressTooltip label={m?.general.delete} kbd="Del">
            {({ props }) => (
              <Button
                className="ms-1"
                variant="danger"
                onClick={() => {
                  dispatch(objectsSetFilter([]));
                }}
                {...props}
              >
                {active.length} <FaTrash />
              </Button>
            )}
          </LongPressTooltip>
        )}
      </Dropdown>
    </ToolMenu>
  );
}
