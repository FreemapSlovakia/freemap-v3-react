import {
  changesetsSetAuthorName,
  changesetsSetDays,
} from 'fm3/actions/changesetsActions';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { FaEraser, FaSync } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

export function ChangesetsMenu(): ReactElement {
  const m = useMessages();

  const [authorName, setAuthorName] = useState<string | null>(
    useSelector((state) => state.changesets.authorName),
  );

  const days = useSelector((state) => state.changesets.days || 3);

  const zoom = useSelector((state) => state.map.zoom);

  const canSearchWithThisAmountOfDays = (amountOfDays: number) => {
    return (
      !!authorName ||
      (amountOfDays === 3 && zoom >= 9) ||
      (amountOfDays === 7 && zoom >= 10) ||
      (amountOfDays === 14 && zoom >= 11)
    );
  };

  const dispatch = useDispatch();

  return (
    <>
      <Dropdown
        className="ml-1"
        onSelect={(d) => {
          if (canSearchWithThisAmountOfDays(Number(d))) {
            dispatch(changesetsSetDays(Number(d)));
          }
        }}
      >
        <Dropdown.Toggle variant="secondary" id="days">
          {m?.changesets.olderThanFull({ days }) ?? '…'}
        </Dropdown.Toggle>
        <Dropdown.Menu
          popperConfig={{
            strategy: 'fixed',
          }}
        >
          {[3, 7, 14, 30].map((d) => (
            <Dropdown.Item
              key={d}
              eventKey={String(d)}
              disabled={!canSearchWithThisAmountOfDays(d)}
              active={d === days}
            >
              {m?.changesets.olderThan({ days: d })}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
      <Form
        className="ml-1 d-flex flex-nowrap"
        inline
        onSubmit={(e) => {
          e.preventDefault();
          dispatch(changesetsSetDays(days));
          dispatch(changesetsSetAuthorName(authorName));
        }}
      >
        <InputGroup className="flex-nowrap">
          <Form.Control
            type="text"
            placeholder={m?.changesets.allAuthors}
            onChange={(e) => {
              setAuthorName(e.target.value || null);
            }}
            value={authorName ?? ''}
          />
          <InputGroup.Append>
            <Button
              variant="secondary"
              disabled={!authorName}
              onClick={() => {
                setAuthorName(null);
              }}
            >
              <FaEraser />
            </Button>
          </InputGroup.Append>
        </InputGroup>
        <Button
          className="ml-1"
          variant="secondary"
          type="submit"
          disabled={!canSearchWithThisAmountOfDays(days)}
          title={m?.changesets.download}
        >
          <FaSync />
          <span className="d-none d-sm-inline"> {m?.changesets.download}</span>
        </Button>
      </Form>
    </>
  );
}
