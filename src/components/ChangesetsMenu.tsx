import { type ReactElement, useState } from 'react';
import { Button, Dropdown, Form, InputGroup } from 'react-bootstrap';
import { FaEraser } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { changesetsSetParams } from '../actions/changesetsActions.js';
import { fixedPopperConfig } from '../fixedPopperConfig.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useMessages } from '../l10nInjector.js';
import { ToolMenu } from './ToolMenu.js';

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
      <Dropdown
        className="ms-1"
        onSelect={(d) => {
          dispatch(changesetsSetParams({ days: Number(d) }));
        }}
      >
        <Dropdown.Toggle variant="secondary" id="days">
          {m?.changesets.olderThanFull({ days }) ?? '…'}
        </Dropdown.Toggle>

        <Dropdown.Menu popperConfig={fixedPopperConfig}>
          {[3, 7, 14, 30].map((d) => (
            <Dropdown.Item key={d} eventKey={String(d)} active={d === days}>
              {m?.changesets.olderThan({ days: d })}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

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

          <Button
            variant="secondary"
            disabled={!authorName}
            onClick={() => {
              setAuthorName(null);

              dispatch(changesetsSetParams({ days, authorName: null }));
            }}
          >
            <FaEraser />
          </Button>
        </InputGroup>
      </Form>
    </ToolMenu>
  );
}
