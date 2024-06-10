import { gallerySetFilter } from 'fm3/actions/galleryActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useMessages } from 'fm3/l10nInjector';
import {
  ChangeEvent,
  FormEvent,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import Form from 'react-bootstrap/Form';

import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import { FaCheck, FaEraser, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

type Props = { show: boolean };

export default GalleryFilterModal;

export function GalleryFilterModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  const filter = useAppSelector((state) => state.gallery.filter);

  const users = useAppSelector((state) => state.gallery.users);

  const tags = useAppSelector((state) => state.gallery.tags);

  const [tag, setTag] = useState('');

  const [userId, setUserId] = useState('');

  const [takenAtFrom, setTakenAtFrom] = useState('');

  const [takenAtTo, setTakenAtTo] = useState('');

  const [createdAtFrom, setCreatedAtFrom] = useState('');

  const [createdAtTo, setCreatedAtTo] = useState('');

  const [ratingFrom, setRatingFrom] = useState('');

  const [ratingTo, setRatingTo] = useState('');

  const [pano, setPano] = useState<boolean>();

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

    setPano(filter.pano);
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

  const handlePanoChange = useCallback(() => {
    setPano((value) => (value ? false : value === false ? undefined : true));
  }, []);

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
          pano,
        }),
      );

      dispatch(setActiveModal(null));
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
      pano,
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

    setPano(undefined);
  };

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const [panoCheck, setPanoCheck] = useState<HTMLInputElement | null>(null);

  useEffect(() => {
    if (panoCheck) {
      panoCheck.indeterminate = pano === undefined;
    }
  }, [panoCheck, pano]);

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>{m?.gallery.filterModal.title}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleFormSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>{m?.gallery.filterModal.tag}</Form.Label>

            <Form.Select value={tag} onChange={handleTagChange}>
              <option value="" />

              <option value="⌘">« {m?.gallery.filterModal.noTags} »</option>
              {tags.map(({ name, count }) => (
                <option key={name} value={name}>
                  {name} ({count})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{m?.gallery.filterModal.author}</Form.Label>

            <Form.Select value={userId} onChange={handleUserIdChange}>
              <option value="" />

              {users.map(({ id, name, count }) => (
                <option key={id} value={id}>
                  {name} ({count})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{m?.gallery.filterModal.createdAt}</Form.Label>

            <InputGroup>
              <Form.Control
                type="date"
                value={createdAtFrom}
                onChange={handleCreatedAtFromChange}
              />

              <InputGroup.Text> - </InputGroup.Text>

              <Form.Control
                type="date"
                value={createdAtTo}
                onChange={handleCreatedAtToChange}
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{m?.gallery.filterModal.takenAt}</Form.Label>

            <InputGroup>
              <Form.Control
                type="date"
                value={takenAtFrom}
                onChange={handleTakenAtFromChange}
              />

              <InputGroup.Text> - </InputGroup.Text>

              <Form.Control
                type="date"
                value={takenAtTo}
                onChange={handleTakenAtToChange}
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{m?.gallery.filterModal.rating}</Form.Label>

            <InputGroup>
              <Form.Control
                type="number"
                min={1}
                max={ratingTo || 5}
                step="any"
                value={ratingFrom}
                onChange={handleRatingFromChange}
              />

              <InputGroup.Text> - </InputGroup.Text>

              <Form.Control
                type="number"
                min={ratingFrom || 1}
                max={5}
                step="any"
                value={ratingTo}
                onChange={handleRatingToChange}
              />
            </InputGroup>
          </Form.Group>

          <Form.Check
            className="mb-3"
            id="filt-pano"
            checked={!!pano}
            onChange={handlePanoChange}
            label={m?.gallery.filterModal.pano}
            ref={setPanoCheck}
          />
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
      </Form>
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
