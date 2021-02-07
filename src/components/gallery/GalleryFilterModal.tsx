import {
  galleryHideFilter,
  gallerySetFilter,
} from 'fm3/actions/galleryActions';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import {
  ChangeEvent,
  FormEvent,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import { FaCheck, FaEraser, FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

type Props = { show: boolean };

export function GalleryFilterModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

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

  const handleTagChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setTag(e.currentTarget.value);
  }, []);

  const handleUserIdChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setUserId(e.currentTarget.value);
    },
    [],
  );

  const handleTakenAtFromChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setTakenAtFrom(e.currentTarget.value);
    },
    [],
  );

  const handleTakenAtToChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setTakenAtTo(e.currentTarget.value);
    },
    [],
  );

  const handleCreatedAtFromChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setCreatedAtFrom(e.currentTarget.value);
    },
    [],
  );

  const handleCreatedAtToChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setCreatedAtTo(e.currentTarget.value);
    },
    [],
  );

  const handleRatingFromChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setRatingFrom(e.currentTarget.value);
    },
    [],
  );

  const handleRatingToChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setRatingTo(e.currentTarget.value);
    },
    [],
  );

  const handleFormSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
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
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>{m?.gallery.filterModal.title}</Modal.Title>
      </Modal.Header>
      <form onSubmit={handleFormSubmit}>
        <Modal.Body>
          <FormGroup>
            <FormLabel>{m?.gallery.filterModal.tag}</FormLabel>
            <FormControl as="select" value={tag} onChange={handleTagChange}>
              <option value="" />
              <option value="⌘">« {m?.gallery.filterModal.noTags} »</option>
              {tags.map(({ name, count }) => (
                <option key={name} value={name}>
                  {name} ({count})
                </option>
              ))}
            </FormControl>
          </FormGroup>
          <FormGroup>
            <FormLabel>{m?.gallery.filterModal.author}</FormLabel>
            <FormControl
              as="select"
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
            <FormLabel>{m?.gallery.filterModal.createdAt}</FormLabel>
            <InputGroup>
              <FormControl
                type="date"
                value={createdAtFrom}
                onChange={handleCreatedAtFromChange}
              />
              <InputGroup.Append>
                <InputGroup.Text> - </InputGroup.Text>
              </InputGroup.Append>
              <FormControl
                type="date"
                value={createdAtTo}
                onChange={handleCreatedAtToChange}
              />
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <FormLabel>{m?.gallery.filterModal.takenAt}</FormLabel>
            <InputGroup>
              <FormControl
                type="date"
                value={takenAtFrom}
                onChange={handleTakenAtFromChange}
              />
              <InputGroup.Append>
                <InputGroup.Text> - </InputGroup.Text>
              </InputGroup.Append>
              <FormControl
                type="date"
                value={takenAtTo}
                onChange={handleTakenAtToChange}
              />
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <FormLabel>{m?.gallery.filterModal.rating}</FormLabel>
            <InputGroup>
              <FormControl
                type="number"
                min={1}
                max={ratingTo || 5}
                step="any"
                value={ratingFrom}
                onChange={handleRatingFromChange}
              />
              <InputGroup.Append>
                <InputGroup.Text> - </InputGroup.Text>
              </InputGroup.Append>
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
            <FaCheck /> {m?.general.apply}
          </Button>
          <Button variant="warning" type="button" onClick={handleEraseClick}>
            <FaEraser /> {m?.general.clear}
          </Button>
          <Button variant="dark" type="button" onClick={close}>
            <FaTimes /> {m?.general.cancel}
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
