import { useMessages } from '@features/l10n/l10nInjector.js';
import { ActionIcon, Button, Menu } from '@mantine/core';
import { ToolMenu } from '@shared/components/ToolMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { FaCaretDown, FaEraser } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { changesetsSetParams } from '../model/actions.js';

export default ChangesetsMenu;

export function ChangesetsMenu(): ReactElement {
  const m = useMessages();

  const [authorName, setAuthorName] = useState<string | null>(
    useAppSelector((state) => state.changesets.authorName),
  );

  const days = useAppSelector((state) => state.changesets.days || 3);

  const dispatch = useDispatch();

  return (
    <ToolMenu>
      <Menu>
        <Menu.Target>
          <Button
            className="ms-1"
            color="gray"
            size="sm"
            rightSection={<FaCaretDown />}
          >
            {m?.changesets.olderThanFull({ days }) ?? '…'}
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          {[3, 7, 14, 30].map((d) => (
            <Menu.Item
              key={d}
              color={d === days ? 'blue' : undefined}
              onClick={() => dispatch(changesetsSetParams({ days: d }))}
            >
              {m?.changesets.olderThan({ days: d })}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>

      <Form
        className="ms-1 d-flex flex-nowrap"
        onSubmit={(e) => {
          e.preventDefault();

          dispatch(changesetsSetParams({ days, authorName }));
        }}
      >
        <InputGroup className="flex-nowrap">
          <Form.Control
            type="text"
            placeholder={m?.changesets.allAuthors}
            onChange={(e) => {
              setAuthorName(e.target.value || null);
            }}
            onBlur={() => dispatch(changesetsSetParams({ days, authorName }))}
            value={authorName ?? ''}
          />

          <ActionIcon
            variant="filled"
            color="gray"
            size="input-sm"
            disabled={!authorName}
            onClick={() => {
              setAuthorName(null);

              dispatch(changesetsSetParams({ days, authorName: null }));
            }}
          >
            <FaEraser />
          </ActionIcon>
        </InputGroup>
      </Form>
    </ToolMenu>
  );
}
