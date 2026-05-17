import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  ActionIcon,
  Button,
  CheckIcon,
  Combobox,
  Divider,
  Group,
  Menu,
  ScrollArea,
  TextInput,
  useCombobox,
} from '@mantine/core';
import { getOsmMapping, resolveGenericName } from '@osm/osmNameResolver.js';
import { osmTagToIconMapping } from '@osm/osmTagToIconMapping.js';
import { Node, OsmMapping } from '@osm/types.js';
import { MantineLongPressTooltip } from '@shared/components/MantineLongPressTooltip.js';
import { ToolMenu } from '@shared/components/ToolMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useEffectiveChosenLanguage } from '@shared/hooks/useEffectiveChosenLanguage.js';
import { removeAccents } from '@shared/stringUtils.js';
import {
  type ChangeEvent,
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { FaCircle, FaMapMarker, FaSquare, FaTrash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  type MarkerType,
  objectsSetFilter,
  setSelectedIcon,
} from '../model/actions.js';

export default ObjectsMenu;

export function ObjectsMenu(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const [filter, setFilter] = useState('');

  const [activeOnOpen, setActiveOnOpen] = useState<string[]>([]);

  const combobox = useCombobox({
    onDropdownOpen: () => setActiveOnOpen(active),
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const handleFilterSet = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setFilter(e.currentTarget.value);
      combobox.openDropdown();
      combobox.updateSelectedOptionIndex();
    },
    [combobox],
  );

  const lang = useEffectiveChosenLanguage();

  const [osmMapping, setOsmMapping] = useState<OsmMapping>();

  const items = useMemo(() => {
    if (!osmMapping) {
      return;
    }

    const res: {
      name: string;
      tags: { key: string; value?: string }[];
      key: string;
    }[] = [];

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

          const finalTags =
            !key && tagKeyOrValue === '*'
              ? tags
              : [
                  ...tags,
                  key ? { key, value: tagKeyOrValue } : { key: tagKeyOrValue },
                ];

          res.push({
            name: nodeOrName.replace('{}', '').trim(),
            tags: finalTags,
            key: finalTags
              .map((tag) =>
                'value' in tag && tag.value !== undefined
                  ? `${tag.key}=${tag.value}`
                  : `${tag.key}=undefined`,
              )
              .join(','),
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

  const toggleTag = useCallback(
    (tags: string) => {
      dispatch(
        objectsSetFilter(
          active.includes(tags)
            ? active.filter((item) => item !== tags)
            : [...active, tags],
        ),
      );
    },
    [dispatch, active],
  );

  const normalizedFilter = removeAccents(filter.trim().toLowerCase());

  const filteredItems = useMemo(() => {
    if (!items) {
      return [];
    }

    return items
      .filter(
        (item) =>
          item.name &&
          (!normalizedFilter ||
            removeAccents(item.name.toLowerCase()).includes(normalizedFilter)),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, normalizedFilter]);

  // The "selected" group at the top is snapshotted when the dropdown opens
  // so the items don't jump around while the user toggles them — only the
  // check marks change. Next open refreshes the snapshot.
  const selectedItems = useMemo(
    () => filteredItems.filter((item) => activeOnOpen.includes(item.key)),
    [filteredItems, activeOnOpen],
  );

  const renderOption = (
    item: {
      key: string;
      name: string;
      tags: { key: string; value?: string }[];
    },
    section: 'selected' | 'all',
  ) => {
    const img = resolveGenericName(
      osmTagToIconMapping,
      Object.fromEntries(
        item.tags.map(({ key, value }) => [key, value ?? '*']),
      ),
    );

    const isActive = active.includes(item.key);

    return (
      <Combobox.Option
        value={item.key}
        key={`${section}:${item.key}`}
        active={isActive}
      >
        <Group gap="xs" wrap="nowrap">
          {isActive ? (
            <CheckIcon size={12} />
          ) : (
            <span style={{ width: 12, display: 'inline-block' }} />
          )}

          {img.length > 0 ? (
            <img src={img[0]} style={{ width: '1em', height: '1em' }} alt="" />
          ) : (
            <span
              style={{ width: '1em', height: '1em', display: 'inline-block' }}
            />
          )}

          <span>{item.name}</span>
        </Group>
      </Combobox.Option>
    );
  };

  const selectedIconValue = useAppSelector(
    (state) => state.objects.selectedIcon,
  );

  const handleIconChange = (selectedIconValue: MarkerType) => {
    dispatch(setSelectedIcon(selectedIconValue));
  };

  return (
    <ToolMenu>
      <Combobox
        store={combobox}
        width="max-content"
        onOptionSubmit={(value) => {
          toggleTag(value);
        }}
      >
        <Combobox.Target>
          <TextInput
            className="ms-1"
            type="search"
            size="sm"
            w="8em"
            placeholder={m?.objects.type}
            value={filter}
            onChange={handleFilterSet}
            onClick={() => combobox.openDropdown()}
            onFocus={() => combobox.openDropdown()}
            onBlur={() => combobox.closeDropdown()}
          />
        </Combobox.Target>

        <Combobox.Dropdown>
          <Combobox.Options>
            <ScrollArea.Autosize mah="calc(100dvh - 150px)" type="auto">
              {filteredItems.length > 0 ? (
                <>
                  {selectedItems.map((item) => renderOption(item, 'selected'))}

                  {selectedItems.length > 0 && <Divider my={4} />}

                  {filteredItems.map((item) => renderOption(item, 'all'))}
                </>
              ) : (
                <Combobox.Empty>{m?.search.noResults}</Combobox.Empty>
              )}
            </ScrollArea.Autosize>
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>

      <Menu>
        <Menu.Target>
          <ActionIcon
            className="ms-1"
            variant="filled"
            color="gray"
            size="input-sm"
          >
            {selectedIconValue === 'ring' ? (
              <FaCircle />
            ) : selectedIconValue === 'square' ? (
              <FaSquare />
            ) : (
              <FaMapMarker />
            )}
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item
            leftSection={<FaMapMarker />}
            color={selectedIconValue === 'pin' ? 'blue' : undefined}
            onClick={() => handleIconChange('pin')}
          >
            {m?.objects.icon.pin}
          </Menu.Item>

          <Menu.Item
            leftSection={<FaCircle />}
            color={selectedIconValue === 'ring' ? 'blue' : undefined}
            onClick={() => handleIconChange('ring')}
          >
            {m?.objects.icon.ring}
          </Menu.Item>

          <Menu.Item
            leftSection={<FaSquare />}
            color={selectedIconValue === 'square' ? 'blue' : undefined}
            onClick={() => handleIconChange('square')}
          >
            {m?.objects.icon.square}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      {active.length > 0 && (
        <MantineLongPressTooltip label={m?.general.delete} kbd="Del">
          {({ props }) => (
            <Button
              className="ms-1"
              color="red"
              size="sm"
              rightSection={<FaTrash />}
              onClick={() => {
                dispatch(objectsSetFilter([]));
              }}
              {...props}
            >
              {active.length}
            </Button>
          )}
        </MantineLongPressTooltip>
      )}
    </ToolMenu>
  );
}
