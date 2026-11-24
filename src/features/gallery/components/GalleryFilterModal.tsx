import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { ManualHeaderButton } from '@features/documents/components/ManualHeaderButton.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { Text } from '@features/l10n/Text.js';
import { ANY, fromAnyValue, withAnyValue } from '@shared/anyToggle.js';
import { FitToggleButtonGroup } from '@shared/components/FitButtonGroup.js';
import {
  FmDismissButton,
  FmFooterButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import {
  LongPressTooltip,
  type TooltipTargetProps,
} from '@shared/components/LongPressTooltip.js';
import { Modal } from '@shared/components/Modal.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { isInvalidInt } from '@shared/numberValidator.js';
import { makeLabelComparator } from '@shared/stringUtils.js';
import {
  type ChangeEvent,
  type ReactElement,
  type SubmitEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Form,
  InputGroup,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import { FaCamera, FaCheck, FaEraser, FaFilter } from 'react-icons/fa';
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
import { parseTagKey, tagKey, tagRelations, tagTree } from '../tagRefs.js';
import { useGalleryMessages } from '../translations/useGalleryMessages.js';
import { TagRelationLine } from './TagRelationLine.js';

type Props = { show: boolean };

/** The select's value for photos with no tags; any other is a `tagKey`. */
const NO_TAGS = '⌘';

/** A tag not in the list: its name, else its id. */
function shownTagKey(key: string) {
  const parsed = parseTagKey(key);

  return parsed && 'id' in parsed ? `#${parsed.id}` : (parsed?.name ?? key);
}

export default function GalleryFilterModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  const gm = useGalleryMessages();

  const filter = useAppSelector((state) => state.gallerySettings.filter);

  const currentUserId = useAppSelector((state) => state.auth.user?.id);

  const users = useAppSelector((state) => state.gallery.users);

  const tags = useAppSelector((state) => state.gallery.tags);

  const language = useAppSelector((state) => state.l10n.language);

  // Memoized by hand: the compiler skips this component, and the list is long.
  const tagOptions = useMemo(() => {
    const shownCounts = Map.groupBy(tags, (t) => t.label ?? t.name);

    const compare = makeLabelComparator(language);

    // Two tags shown alike are told apart by their names.
    const shownOf = new Map(
      tags.map(({ id, name, label }) => [
        id,
        label && (shownCounts.get(label)?.length ?? 0) > 1
          ? `${label} · ${name}`
          : (label ?? name),
      ]),
    );

    const tree = tagTree(tags, (a, b) =>
      compare(shownOf.get(a.id)!, shownOf.get(b.id)!),
    );

    const relations = tagRelations(tags, language);

    return tree.map(({ tag: { id, name, count }, depth, key }) => ({
      key,
      value: tagKey({ id, name }),
      shown: '   '.repeat(depth) + shownOf.get(id),
      count,
      relation: relations.get(id),
    }));
  }, [tags, language]);

  const [tag, setTag] = useState('');

  const selectedRelation = tagOptions.find(
    ({ value }) => value === tag,
  )?.relation;

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
    setTag(
      filter.tagId !== undefined
        ? tagKey({ id: filter.tagId, name: '' })
        : filter.tag === ''
          ? NO_TAGS
          : filter.tag
            ? tagKey({ name: filter.tag })
            : '',
    );

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
          // An id, or a name from an older link or map, kept as it came.
          ...(tag === NO_TAGS
            ? { tag: '' }
            : (() => {
                const parsed = parseTagKey(tag);

                return parsed && 'id' in parsed
                  ? { tagId: parsed.id }
                  : { tag: parsed?.name };
              })()),
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

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  // As the events filter's: applied, not only cleared in the form.
  const handleEraseClick = () => {
    dispatch(gallerySetFilter({}));

    close();
  };

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

  // The applied filter, which Clear removes.
  const filterEmpty = Object.values(filter).every((v) => v === undefined);

  useDocumentTitle(show ? gm?.filterModal.title : undefined);

  // Shown under the filters Wikimedia photos can't satisfy: tag/author, and the
  // panorama toggle (no Wikimedia photo is a panorama for us). Date/rating/
  // license just narrow them, so those carry no hint.
  const wikimediaExcludedHint = (
    <Form.Text className="text-body-secondary">
      <SiWikimediacommons /> <Text m={gm} k="excludesWikimedia" />
    </Form.Text>
  );

  const tagSelect = (props: TooltipTargetProps) => (
    <Form.Select value={tag} onChange={handleTagChange} {...props}>
      <option value="" />

      <option value={NO_TAGS}>« {gm?.filterModal.noTags} »</option>

      {/* A name from an older link, or an id not in the list (gone, or the
          list still loading): shown, so it can be cleared. */}
      {tag &&
        tag !== NO_TAGS &&
        !tagOptions.some(({ value }) => value === tag) && (
          <option value={tag}>{shownTagKey(tag)}</option>
        )}

      {/* Own photos only; a broader tag without them gets no "(0)", which
          would hide what its narrower tags find. */}
      {/* A tag under two broader ones is two options of one value. */}
      {tagOptions.map(({ key, value, shown, count }) => (
        <option key={key} value={value}>
          {shown}
          {count > 0 && ` (${count})`}
        </option>
      ))}
    </Form.Select>
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
            <FaCamera /> <FaFilter /> <Text m={gm} k="filterModal.title" />
          </Modal.Title>
          <ManualHeaderButton chapter="photos" />
        </Modal.Header>

        <Modal.Body>
          <Form.Group controlId="tag" className="mb-3">
            <Form.Label>
              <Text m={gm} k="filterModal.tag" />
            </Form.Label>

            {/* An open list's options take no tooltip, so the selected one's
                hangs on the select. */}
            <LongPressTooltip
              label={
                selectedRelation && (
                  <TagRelationLine relation={selectedRelation} />
                )
              }
              // False: counts as shown inline, so no tooltip opens.
              hideLabel={selectedRelation !== undefined}
            >
              {({ props }) => tagSelect(props)}
            </LongPressTooltip>

            {wikimediaExcludedHint}
          </Form.Group>

          <Form.Group controlId="author" className="mb-3">
            <Form.Label>
              <Text m={gm} k="filterModal.author" />
            </Form.Label>

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
            <Form.Label>
              <Text m={gm} k="filterModal.createdAt" />
            </Form.Label>

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
            <Form.Label>
              <Text m={gm} k="filterModal.takenAt" />
            </Form.Label>

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
            <Form.Label>
              <Text m={gm} k="filterModal.rating" />
            </Form.Label>

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

          <div className="mb-3">
            <Form.Check
              id="filt-pano"
              checked={Boolean(pano)}
              onChange={handlePanoChange}
              label={gm?.filterModal.pano}
              ref={setPanoCheck}
            />

            {wikimediaExcludedHint}
          </div>

          <Form.Group controlId="filt-license" className="mb-3">
            <Form.Label className="d-block">
              <Text m={gm} k="license.label" />
            </Form.Label>

            <ToggleButtonGroup
              type="checkbox"
              value={withAnyValue(license)}
              onChange={(value: (GalleryLicense | typeof ANY)[]) =>
                setLicense(fromAnyValue(value, license))
              }
              className="d-flex flex-wrap gap-2"
            >
              <ToggleButton
                id="filt-lic-any"
                value={ANY}
                variant="outline-primary"
                className="rounded flex-grow-0"
              >
                <Text m={gm} k="filterModal.anyLicense" />
              </ToggleButton>

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
          </Form.Group>

          <Form.Group controlId="filt-source" className="mb-3">
            <Form.Label className="d-block">
              <Text m={gm} k="filterModal.source" />
            </Form.Label>

            <FitToggleButtonGroup
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
                <Text m={gm} k="filterModal.allSources" />
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
            </FitToggleButtonGroup>
          </Form.Group>
        </Modal.Body>

        <FmModalFooter>
          <FmFooterButton
            type="submit"
            disabled={invalidRatingFrom || invalidRatingTo}
            icon={<FaCheck />}
            label={m?.general.apply}
          />

          <FmFooterButton
            variant="secondary"
            onClick={handleEraseClick}
            disabled={filterEmpty}
            icon={<FaEraser />}
            label={m?.general.clear}
          />

          <FmDismissButton label={m?.general.cancel} onClick={close} />
        </FmModalFooter>
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
