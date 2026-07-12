import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { isInvalidInt } from '@shared/numberValidator.js';
import {
  type ChangeEvent,
  type ReactElement,
  type SubmitEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  Button,
  Form,
  InputGroup,
  Modal,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import { FaCamera, FaCheck, FaEraser, FaFilter, FaTimes } from 'react-icons/fa';
import { IoFlower } from 'react-icons/io5';
import { SiWikimediacommons } from 'react-icons/si';
import { useDispatch } from 'react-redux';
import { GALLERY_SOURCES, type GallerySource } from '../galleryUtils.js';
import {
  type GalleryLicense,
  LicenseBadge,
  PHOTO_LICENSES,
} from '../licenses.js';
import { gallerySetFilter } from '../model/actions.js';
import { useGalleryMessages } from '../translations/useGalleryMessages.js';

type Props = { show: boolean };

export default function GalleryFilterModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  const gm = useGalleryMessages();

  const filter = useAppSelector((state) => state.gallery.filter);

  const currentUserId = useAppSelector((state) => state.auth.user?.id);

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

  const [premium, setPremium] = useState<boolean>();

  const [license, setLicense] = useState<GalleryLicense[]>([]);

  const [sources, setSources] = useState<GallerySource[]>(GALLERY_SOURCES);

  useEffect(() => {
    setTag(filter.tag === '' ? '⌘' : (filter.tag ?? ''));

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

    setPremium(filter.premium);

    setLicense(filter.license ?? []);

    setSources(filter.sources ?? GALLERY_SOURCES);
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

  const handlePremiumChange = useCallback(() => {
    setPremium((value) => (value ? false : value === false ? undefined : true));
  }, []);

  const handleFormSubmit = useCallback(
    (e: SubmitEvent<HTMLFormElement>) => {
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
          premium,
          license: license.length ? license : undefined,
          // Both selected = no restriction (undefined); otherwise the subset.
          sources:
            sources.length === GALLERY_SOURCES.length ? undefined : sources,
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
      premium,
      license,
      sources,
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

    setPremium(undefined);

    setLicense([]);

    setSources(GALLERY_SOURCES);
  };

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const [panoCheck, setPanoCheck] = useState<HTMLInputElement | null>(null);

  const [premiumCheck, setPremiumCheck] = useState<HTMLInputElement | null>(
    null,
  );

  useEffect(() => {
    if (panoCheck) {
      panoCheck.indeterminate = pano === undefined;
    }
  }, [panoCheck, pano]);

  useEffect(() => {
    if (premiumCheck) {
      premiumCheck.indeterminate = premium === undefined;
    }
  }, [premiumCheck, premium]);

  const invalidRatingFrom = isInvalidInt(
    ratingFrom,
    false,
    1,
    parseInt(ratingTo, 10) ?? 5,
  );
  const invalidRatingTo = isInvalidInt(
    ratingTo,
    false,
    parseInt(ratingFrom, 10) ?? 1,
    5,
  );

  const filterEmpty =
    tag === '' &&
    userId === '' &&
    takenAtFrom === '' &&
    takenAtTo === '' &&
    createdAtFrom === '' &&
    createdAtTo === '' &&
    ratingFrom === '' &&
    ratingTo === '' &&
    pano === undefined &&
    premium === undefined &&
    license.length === 0 &&
    sources.length === GALLERY_SOURCES.length;

  useDocumentTitle(show ? gm?.filterModal.title : undefined);

  // Shown under the filters Wikimedia photos can't satisfy (tag/author/license).
  const wikimediaExcludedHint = (
    <Form.Text className="text-body-secondary">
      <SiWikimediacommons /> {gm?.excludesWikimedia}
    </Form.Text>
  );

  return (
    <Modal
      show={show}
      onHide={close}
      contentClassName="bg-body-tertiary"
      scrollable
    >
      <form onSubmit={handleFormSubmit} className="d-contents">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCamera /> <FaFilter /> {gm?.filterModal.title}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group controlId="tag" className="mb-3">
            <Form.Label>{gm?.filterModal.tag}</Form.Label>

            <Form.Select value={tag} onChange={handleTagChange}>
              <option value="" />

              <option value="⌘">« {gm?.filterModal.noTags} »</option>
              {tags.map(({ name, count }) => (
                <option key={name} value={name}>
                  {name} ({count})
                </option>
              ))}
            </Form.Select>

            {wikimediaExcludedHint}
          </Form.Group>

          <Form.Group controlId="author" className="mb-3">
            <Form.Label>{gm?.filterModal.author}</Form.Label>

            <Form.Select value={userId} onChange={handleUserIdChange}>
              <option value="" />

              {currentUserId ? (
                <>
                  {users
                    .filter(({ id }) => currentUserId === id)
                    .map(({ id, name, count }) => (
                      <option key={id} value={id}>
                        {name} ({count})
                      </option>
                    ))}

                  <option disabled>──────────</option>
                </>
              ) : null}

              {users
                .filter(({ id }) => currentUserId !== id)
                .map(({ id, name, count }) => (
                  <option key={id} value={id}>
                    {name} ({count})
                  </option>
                ))}
            </Form.Select>

            {wikimediaExcludedHint}
          </Form.Group>

          <Form.Group controlId="createdAt" className="mb-3">
            <Form.Label>{gm?.filterModal.createdAt}</Form.Label>

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

          <Form.Group controlId="takenAt" className="mb-3">
            <Form.Label>{gm?.filterModal.takenAt}</Form.Label>

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

          <Form.Group controlId="rating" className="mb-3">
            <Form.Label>{gm?.filterModal.rating}</Form.Label>

            <InputGroup>
              <Form.Control
                type="number"
                min={1}
                max={ratingTo || 5}
                step="any"
                value={ratingFrom}
                isInvalid={invalidRatingFrom}
                onChange={handleRatingFromChange}
              />

              <InputGroup.Text> - </InputGroup.Text>

              <Form.Control
                type="number"
                min={ratingFrom || 1}
                max={5}
                step="any"
                value={ratingTo}
                isInvalid={invalidRatingTo}
                onChange={handleRatingToChange}
              />
            </InputGroup>
          </Form.Group>

          <Form.Check
            className="mb-3"
            id="filt-premiumOnly"
            checked={Boolean(premium)}
            onChange={handlePremiumChange}
            label={gm?.filterModal.premium}
            ref={setPremiumCheck}
          />

          <Form.Check
            className="mb-3"
            id="filt-pano"
            checked={Boolean(pano)}
            onChange={handlePanoChange}
            label={gm?.filterModal.pano}
            ref={setPanoCheck}
          />

          <Form.Group controlId="filt-license" className="mb-3">
            <Form.Label className="d-block">{gm?.license.label}</Form.Label>

            <ToggleButtonGroup
              type="checkbox"
              value={license}
              onChange={(value: GalleryLicense[]) => setLicense(value)}
              className="d-flex flex-wrap gap-2"
            >
              {PHOTO_LICENSES.map(({ id }) => (
                <ToggleButton
                  key={id}
                  id={`filt-lic-${id}`}
                  value={id}
                  variant="outline-primary"
                  className="rounded flex-grow-0"
                  title={gm?.license.descriptions[id]}
                >
                  <LicenseBadge licenseId={id} /> {gm?.license.names[id] ?? id}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            {wikimediaExcludedHint}
          </Form.Group>

          <Form.Group controlId="filt-source" className="mb-3">
            <Form.Label className="d-block">
              {gm?.filterModal.source}
            </Form.Label>

            <ToggleButtonGroup
              type="radio"
              name="filt-source"
              // Exactly one is always selected — 'all' means no restriction.
              value={
                sources.length < GALLERY_SOURCES.length ? sources[0] : 'all'
              }
              onChange={(value: GallerySource | 'all') =>
                setSources(value === 'all' ? [...GALLERY_SOURCES] : [value])
              }
            >
              <ToggleButton
                id="filt-src-all"
                value="all"
                variant="outline-primary"
              >
                {gm?.filterModal.allSources}
              </ToggleButton>

              <ToggleButton
                id="filt-src-gallery"
                value="gallery"
                variant="outline-primary"
              >
                <IoFlower /> Freemap
              </ToggleButton>

              <ToggleButton
                id="filt-src-wikimedia"
                value="wikimedia"
                variant="outline-primary"
              >
                <SiWikimediacommons /> Wikimedia Commons
              </ToggleButton>
            </ToggleButtonGroup>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button type="submit" disabled={invalidRatingFrom || invalidRatingTo}>
            <FaCheck /> {m?.general.apply}
          </Button>

          <Button
            variant="secondary"
            onClick={handleEraseClick}
            disabled={filterEmpty}
          >
            <FaEraser /> {m?.general.clear}
          </Button>

          <Button variant="dark" onClick={close}>
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
