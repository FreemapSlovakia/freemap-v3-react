import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import Form from 'react-bootstrap/lib/Form';
import Button from 'react-bootstrap/lib/Button';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { withTranslator, Translator } from 'fm3/l10nInjector';

import {
  changesetsSetDays,
  changesetsSetAuthorName,
} from 'fm3/actions/changesetsActions';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const ChangesetsMenuInt: React.FC<Props> = ({
  days,
  t,
  onChangesetsSetDays,
  zoom,
  onChangesetsSetAuthorNameAndRefresh,
  authorName: propsAuthorName,
}) => {
  const [authorName, setAuthorName] = useState<string | null>(null);

  useEffect(() => {
    setAuthorName(propsAuthorName);
  }, [propsAuthorName]);

  const canSearchWithThisAmountOfDays = (amountOfDays: number) => {
    return (
      !!authorName ||
      (amountOfDays === 3 && zoom >= 9) ||
      (amountOfDays === 7 && zoom >= 10) ||
      (amountOfDays === 14 && zoom >= 11)
    );
  };

  return (
    <Form
      inline
      onSubmit={(e) => {
        e.preventDefault();
        onChangesetsSetAuthorNameAndRefresh(days, authorName);
      }}
    >
      <ButtonGroup>
        <DropdownButton
          id="days"
          onSelect={(d) => {
            if (canSearchWithThisAmountOfDays(d)) {
              onChangesetsSetDays(d);
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
};

const mapStateToProps = (state: RootState) => ({
  days: state.changesets.days || 3,
  authorName: state.changesets.authorName,
  zoom: state.map.zoom,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onChangesetsSetDays(days: number | null) {
    dispatch(changesetsSetDays(days));
  },
  onChangesetsSetAuthorNameAndRefresh(
    days: number | null,
    authorName: string | null,
  ) {
    dispatch(changesetsSetDays(days));
    dispatch(changesetsSetAuthorName(authorName));
  },
});

export const ChangesetsMenu = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(ChangesetsMenuInt));
