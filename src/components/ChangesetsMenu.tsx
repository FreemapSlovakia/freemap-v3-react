import React, { useState, ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Form from 'react-bootstrap/lib/Form';
import Button from 'react-bootstrap/lib/Button';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { useTranslator } from 'fm3/l10nInjector';

import {
  changesetsSetDays,
  changesetsSetAuthorName,
} from 'fm3/actions/changesetsActions';
import { RootState } from 'fm3/storeCreator';

export function ChangesetsMenu(): ReactElement {
  const t = useTranslator();

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
      <ButtonGroup>
        <DropdownButton
          id="days"
          onSelect={(d: unknown) => {
            if (typeof d === 'number' && canSearchWithThisAmountOfDays(d)) {
              dispatch(changesetsSetDays(days));
            }
          }}
          title={t('changesets.olderThanFull', { days })}
        >
          {[3, 7, 14, 30].map((d) => (
            <MenuItem
              key={d}
              eventKey={d}
              disabled={!canSearchWithThisAmountOfDays(d)}
            >
              {t('changesets.olderThan', { days: d })}
            </MenuItem>
          ))}
        </DropdownButton>
      </ButtonGroup>{' '}
      <FormGroup>
        <InputGroup>
          <FormControl
            type="text"
            placeholder={t('changesets.allAuthors')}
            onChange={(e) => {
              setAuthorName((e.target as HTMLInputElement).value || null);
            }}
            value={authorName ?? ''}
          />
          <InputGroup.Button>
            <Button
              disabled={!authorName}
              onClick={() => {
                setAuthorName(null);
              }}
            >
              <FontAwesomeIcon icon="times" />
            </Button>
          </InputGroup.Button>
        </InputGroup>
      </FormGroup>{' '}
      <Button
        type="submit"
        disabled={!canSearchWithThisAmountOfDays(days)}
        title={t('changesets.download')}
      >
        <FontAwesomeIcon icon="refresh" />
        <span className="hidden-xs"> {t('changesets.download')}</span>
      </Button>
    </Form>
  );
}
