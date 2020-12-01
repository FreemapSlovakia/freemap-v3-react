import React, { useState, useEffect, useCallback, ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Modal from 'react-bootstrap/lib/Modal';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import { useTranslator } from 'fm3/l10nInjector';

import {
  gallerySetFilter,
  galleryHideFilter,
} from 'fm3/actions/galleryActions';
import { RootState } from 'fm3/storeCreator';

export function GalleryFilterModal(): ReactElement | null {
  const dispatch = useDispatch();

  const t = useTranslator();

  const filter = useSelector((state: RootState) => state.gallery.filter);

  const users = useSelector((state: RootState) => state.gallery.users);

  const tags = useSelector((state: RootState) => state.gallery.tags);

  const [tag, setTag] = useState('');

  const [userId, setUserId] = useState('');

  const [takenAtFrom, setTakenAtFrom] = useState('');

  const [takenAtTo, setTakenAtTo] = useState('');

  const [createdAtFrom, setCreatedAtFrom] = useState('');

  const [createdAtTo, setCreatedAtTo] = useState('');

  const [ratingFrom, setRatingFrom] = useState('');

  const [ratingTo, setRatingTo] = useState('');

  useEffect(() => {
    setTag(filter.tag === '' ? '⌘' : filter.tag ?? '');

    setUserId(
      typeof filter.userId === 'number' ? filter.userId.toString() : '',
    );

    setTakenAtFrom(
      filter.takenAtFrom instanceof Date
        ? filter.takenAtFrom.toISOString().replace(/T.*/, '')
        : '',
    );

    setTakenAtTo(
      filter.takenAtTo instanceof Date
        ? filter.takenAtTo.toISOString().replace(/T.*/, '')
        : '',
    );

    setCreatedAtFrom(
      filter.createdAtFrom instanceof Date
        ? filter.createdAtFrom.toISOString().replace(/T.*/, '')
        : '',
    );

    setCreatedAtTo(
      filter.createdAtTo instanceof Date
        ? filter.createdAtTo.toISOString().replace(/T.*/, '')
        : '',
    );

    setRatingFrom(
      typeof filter.ratingFrom === 'number' ? filter.ratingFrom.toString() : '',
    );

    setRatingTo(
      typeof filter.ratingTo === 'number' ? filter.ratingTo.toString() : '',
    );
  }, [filter]);

  const handleTagChange = useCallback((e: React.FormEvent<FormControl>) => {
    setTag((e.target as HTMLSelectElement).value);
  }, []);

  const handleUserIdChange = useCallback((e: React.FormEvent<FormControl>) => {
    setUserId((e.target as HTMLSelectElement).value);
  }, []);

  const handleTakenAtFromChange = useCallback(
    (e: React.FormEvent<FormControl>) => {
      setTakenAtFrom((e.target as HTMLInputElement).value);
    },
    [],
  );

  const handleTakenAtToChange = useCallback(
    (e: React.FormEvent<FormControl>) => {
      setTakenAtTo((e.target as HTMLInputElement).value);
    },
    [],
  );

  const handleCreatedAtFromChange = useCallback(
    (e: React.FormEvent<FormControl>) => {
      setCreatedAtFrom((e.target as HTMLInputElement).value);
    },
    [],
  );

  const handleCreatedAtToChange = useCallback(
    (e: React.FormEvent<FormControl>) => {
      setCreatedAtTo((e.target as HTMLInputElement).value);
    },
    [],
  );

  const handleRatingFromChange = useCallback(
    (e: React.FormEvent<FormControl>) => {
      setRatingFrom((e.target as HTMLInputElement).value);
    },
    [],
  );

  const handleRatingToChange = useCallback(
    (e: React.FormEvent<FormControl>) => {
      setRatingTo((e.target as HTMLInputElement).value);
    },
    [],
  );

  const handleFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      dispatch(
        gallerySetFilter({
          tag: tag === '⌘' ? '' : tag || undefined,
          userId: nn(userId ? parseInt(userId, 10) : undefined),
          takenAtFrom: nt(takenAtFrom ? new Date(takenAtFrom) : undefined),
          takenAtTo: nt(takenAtTo ? new Date(takenAtTo) : undefined),
          createdAtFrom: nt(
            createdAtFrom ? new Date(createdAtFrom) : undefined,
          ),
          createdAtTo: nt(createdAtTo ? new Date(createdAtTo) : undefined),
          ratingFrom: nn(ratingFrom ? parseFloat(ratingFrom) : undefined),
          ratingTo: nn(ratingTo ? parseFloat(ratingTo) : undefined),
        }),
      );
    },
    [
      dispatch,
      tag,
      userId,
      takenAtFrom,
      takenAtTo,
      createdAtFrom,
      createdAtTo,
      ratingFrom,
      ratingTo,
    ],
  );

  const handleEraseClick = () => {
    setTag('');
    setUserId('');
    setTakenAtFrom('');
    setTakenAtTo('');
    setCreatedAtFrom('');
    setCreatedAtTo('');
    setRatingFrom('');
    setRatingTo('');
  };

  const close = useCallback(() => {
    dispatch(galleryHideFilter());
  }, [dispatch]);

  return (
    <Modal show onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>{t('gallery.filterModal.title')}</Modal.Title>
      </Modal.Header>
      <form onSubmit={handleFormSubmit}>
        <Modal.Body>
          <FormGroup>
            <ControlLabel>{t('gallery.filterModal.tag')}</ControlLabel>
            <FormControl
              componentClass="select"
              value={tag}
              onChange={handleTagChange}
            >
              <option value="" />
              <option value="⌘">« {t('gallery.filterModal.noTags')} »</option>
              {tags.map(({ name, count }) => (
                <option key={name} value={name}>
                  {name} ({count})
                </option>
              ))}
            </FormControl>
          </FormGroup>
          <FormGroup>
            <ControlLabel>{t('gallery.filterModal.author')}</ControlLabel>
            <FormControl
              componentClass="select"
              value={userId}
              onChange={handleUserIdChange}
            >
              <option value="" />
              {users.map(({ id, name, count }) => (
                <option key={id} value={id}>
                  {name} ({count})
                </option>
              ))}
            </FormControl>
          </FormGroup>
          <FormGroup>
            <ControlLabel>{t('gallery.filterModal.createdAt')}</ControlLabel>
            <InputGroup>
              <FormControl
                type="date"
                value={createdAtFrom}
                onChange={handleCreatedAtFromChange}
              />
              <InputGroup.Addon> - </InputGroup.Addon>
              <FormControl
                type="date"
                value={createdAtTo}
                onChange={handleCreatedAtToChange}
              />
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <ControlLabel>{t('gallery.filterModal.takenAt')}</ControlLabel>
            <InputGroup>
              <FormControl
                type="date"
                value={takenAtFrom}
                onChange={handleTakenAtFromChange}
              />
              <InputGroup.Addon> - </InputGroup.Addon>
              <FormControl
                type="date"
                value={takenAtTo}
                onChange={handleTakenAtToChange}
              />
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <ControlLabel>{t('gallery.filterModal.rating')}</ControlLabel>
            <InputGroup>
              <FormControl
                type="number"
                min={1}
                max={ratingTo || 5}
                step="any"
                value={ratingFrom}
                onChange={handleRatingFromChange}
              />
              <InputGroup.Addon> - </InputGroup.Addon>
              <FormControl
                type="number"
                min={ratingFrom || 1}
                max={5}
                step="any"
                value={ratingTo}
                onChange={handleRatingToChange}
              />
            </InputGroup>
          </FormGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit">
            <Glyphicon glyph="ok" /> {t('general.apply')}
          </Button>
          <Button type="button" onClick={handleEraseClick}>
            <Glyphicon glyph="erase" /> {t('general.clear')}
          </Button>
          <Button type="button" onClick={close}>
            <Glyphicon glyph="remove" /> {t('general.cancel')}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

function nn(value: number | undefined) {
  return value === undefined || Number.isNaN(value) ? undefined : value;
}

function nt(value: Date | undefined) {
  return value instanceof Date && !Number.isNaN(value.getTime())
    ? value
    : undefined;
}
