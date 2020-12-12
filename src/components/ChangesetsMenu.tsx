import { useState, ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { useMessages } from 'fm3/l10nInjector';

import {
  changesetsSetDays,
  changesetsSetAuthorName,
} from 'fm3/actions/changesetsActions';
import { RootState } from 'fm3/storeCreator';
import {
  Button,
  ButtonGroup,
  DropdownButton,
  Form,
  InputGroup,
} from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';

export function ChangesetsMenu(): ReactElement {
  const m = useMessages();

  const [authorName, setAuthorName] = useState<string | null>(
    useSelector((state: RootState) => state.changesets.authorName),
  );

  const days = useSelector((state: RootState) => state.changesets.days || 3);

  const zoom = useSelector((state: RootState) => state.map.zoom);

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
    <Form
      inline
      onSubmit={(e) => {
        e.preventDefault();
        dispatch(changesetsSetDays(days));
        dispatch(changesetsSetAuthorName(authorName));
      }}
    >
      <DropdownButton
        as={ButtonGroup}
        id="days"
        onSelect={(d) => {
          if (typeof d === 'number' && canSearchWithThisAmountOfDays(d)) {
            dispatch(changesetsSetDays(days));
          }
        }}
        title={m?.changesets.olderThanFull({ days })}
      >
        {[3, 7, 14, 30].map((d) => (
          <Dropdown.Item
            key={d}
            eventKey={String(d)}
            disabled={!canSearchWithThisAmountOfDays(d)}
          >
            {m?.changesets.olderThan({ days: d })}
          </Dropdown.Item>
        ))}
      </DropdownButton>
      <InputGroup>
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
            disabled={!authorName}
            onClick={() => {
              setAuthorName(null);
            }}
          >
            <FontAwesomeIcon icon="times" />
          </Button>
        </InputGroup.Append>
      </InputGroup>
      <Button
        type="submit"
        disabled={!canSearchWithThisAmountOfDays(days)}
        title={m?.changesets.download}
      >
        <FontAwesomeIcon icon="refresh" />
        <span className="d-none d-sm-inline"> {m?.changesets.download}</span>
      </Button>
    </Form>
  );
}
