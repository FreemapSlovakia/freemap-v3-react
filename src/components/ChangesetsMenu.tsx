import {
  changesetsSetAuthorName,
  changesetsSetDays,
} from 'fm3/actions/changesetsActions';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { ReactElement, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { useDispatch, useSelector } from 'react-redux';

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
    <>
      <DropdownButton
        variant="secondary"
        id="days"
        onSelect={(d) => {
          if (canSearchWithThisAmountOfDays(Number(d))) {
            dispatch(changesetsSetDays(Number(d)));
          }
        }}
        title={m?.changesets.olderThanFull({ days })}
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
      </DropdownButton>
      <Form
        className="ml-1"
        inline
        onSubmit={(e) => {
          e.preventDefault();
          dispatch(changesetsSetDays(days));
          dispatch(changesetsSetAuthorName(authorName));
        }}
      >
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
              variant="secondary"
              disabled={!authorName}
              onClick={() => {
                setAuthorName(null);
              }}
            >
              <FontAwesomeIcon icon="times" />
            </Button>
          </InputGroup.Append>
        </InputGroup>
      </Form>
      <Button
        className="ml-1"
        variant="secondary"
        type="submit"
        disabled={!canSearchWithThisAmountOfDays(days)}
        title={m?.changesets.download}
      >
        <FontAwesomeIcon icon="refresh" />
        <span className="d-none d-sm-inline"> {m?.changesets.download}</span>
      </Button>
    </>
  );
}
