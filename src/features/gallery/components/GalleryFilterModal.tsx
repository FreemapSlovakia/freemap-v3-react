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
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Modal } from '@shared/components/Modal.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { isInvalidInt } from '@shared/numberValidator.js';
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
import {
  type ListBoxRendererProps,
  ReactTags,
  type Tag,
} from 'react-tag-autocomplete';
import '@shared/styles/react-tags.scss';
import { GALLERY_SOURCES, type GallerySource } from '../galleryUtils.js';
import { useTagSuggestions } from '../hooks/useTagSuggestions.js';
import {
  type GalleryLicense,
  LicenseBadge,
  PHOTO_LICENSES,
} from '../licenses.js';
import {
  filterTagCount,
  filterTagIds,
  gallerySetFilter,
  MAX_FILTER_TAGS,
} from '../model/actions.js';
import { parseTagKey, tagKey, tagNameKey } from '../tagRefs.js';
import { useGalleryMessages } from '../translations/useGalleryMessages.js';
import { TagRelationLine } from './TagRelationLine.js';
import { TagSuggestionOption } from './TagSuggestionOption.js';

type Props = { show: boolean };

/** The value for photos with no tags; any other is a `tagKey`. */
const NO_TAGS = '⌘';

/** Prefixes a chosen tag's chip value. */
const CHOSEN = 'chosen:';

/** A tag not in the list: its name, else its id. */
function shownTagKey(key: string) {
  const parsed = parseTagKey(key);

  return parsed && 'id' in parsed ? `#${parsed.id}` : (parsed?.name ?? key);
}

/**
 * ReactTags' list reaching down to the bottom of the modal body, measured as
 * it renders: any taller, and the body would scroll too.
 */
function FittedListBox({
  children,
  classNames,
  ref,
  ...props
}: ListBoxRendererProps): ReactElement {
  return (
    <div
      className={classNames.listBox}
      {...props}
      ref={(el) => {
        if (typeof ref === 'function') {
          ref(el);
        } else if (ref) {
          ref.current = el;
        }

        const body = el?.closest('.modal-body');

        if (el && body) {
          const bottom =
            body.getBoundingClientRect().bottom -
            Number.parseFloat(getComputedStyle(body).paddingBottom);

          // At least the shared style's 12.5rem, short as the room may be.
          el.style.maxHeight = `${Math.max(200, bottom - el.getBoundingClientRect().top)}px`;
        }
      }}
    >
      {children}
    </div>
  );
}

export default function GalleryFilterModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  const gm = useGalleryMessages();

  const filter = useAppSelector((state) => state.gallerySettings.filter);

  const currentUserId = useAppSelector((state) => state.auth.user?.id);

  const users = useAppSelector((state) => state.gallery.users);

  const tags = useAppSelector((state) => state.gallery.tags);

  const {
    tagOptions,
    optionByKey,
    suggestions: tagSuggestions,
    filterSuggestions: filterTagSuggestions,
  } = useTagSuggestions(tags);

  // `tagKey`s, or NO_TAGS alone.
  const [chosen, setChosen] = useState<string[]>([]);

  const [tagMode, setTagMode] = useState<'any' | 'all'>('any');

  const noTagsLabel = `« ${gm?.filterModal.noTags ?? ''} »`;

  const noTags = useMemo(
    () => ({ value: NO_TAGS, label: noTagsLabel }),
    [noTagsLabel],
  );

  const suggestions = useMemo(
    () => [noTags, ...tagSuggestions],
    [noTags, tagSuggestions],
  );

  const filterSuggestions = useCallback(
    (query: string) => [
      ...(tagNameKey(noTagsLabel).includes(tagNameKey(query)) ? [noTags] : []),
      ...filterTagSuggestions(query),
    ],
    [noTags, noTagsLabel, filterTagSuggestions],
  );

  // By `tagKey`, its first place in the tree.
  const optionByValue = useMemo(() => {
    const byValue = new Map<string, (typeof tagOptions)[number]>();

    for (const option of tagOptions) {
      if (!byValue.has(option.value)) {
        byValue.set(option.value, option);
      }
    }

    return byValue;
  }, [tagOptions]);

  // A name from an older link, or an id not in the list (gone, or the list
  // still loading), shows by itself, so it can be cleared. The value is no
  // suggestion's: picking a chosen tag again would remove it.
  const selectedTags = chosen.map((t) => ({
    value: `${CHOSEN}${t}`,
    label:
      t === NO_TAGS
        ? noTagsLabel
        : (optionByValue.get(t)?.shown ?? shownTagKey(t)),
  }));

  // « no tags » excludes the others, and the other way round.
  const handleTagAdd = useCallback(
    ({ value }: Tag) => {
      if (value === NO_TAGS) {
        setChosen([NO_TAGS]);

        return;
      }

      const option = optionByKey.get(value as string);

      if (option) {
        const picked = option.value;

        // A chip holding the same tag by its name (an older link) goes.
        const sameName = tagKey({ name: option.name });

        setChosen((prev) =>
          prev.includes(picked) || prev.length >= MAX_FILTER_TAGS
            ? prev
            : [
                ...prev.filter(
                  (t) =>
                    t !== NO_TAGS && tagNameKey(t) !== tagNameKey(sameName),
                ),
                picked,
              ],
        );
      }
    },
    [optionByKey],
  );

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
    setChosen(
      filter.tag === ''
        ? [NO_TAGS]
        : [
            ...(filter.tagIds ?? []).map((id) => tagKey({ id, name: '' })),
            ...(filter.tag ? [tagKey({ name: filter.tag })] : []),
          ],
    );

    setTagMode(filter.tagMode ?? 'any');

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
          // Ids, and a name from an older link or map, kept as it came.
          ...(chosen.includes(NO_TAGS)
            ? { tag: '' }
            : (() => {
                const parsed = chosen.map(parseTagKey);

                const tagIds = parsed.flatMap((p) =>
                  p && 'id' in p ? [p.id] : [],
                );

                const tag = parsed.flatMap((p) =>
                  p && 'name' in p ? [p.name] : [],
                )[0];

                return {
                  tagIds: filterTagIds(tagIds),
                  tagMode:
                    tagMode === 'all' && filterTagCount({ tagIds, tag }) > 1
                      ? ('all' as const)
                      : undefined,
                  tag,
                };
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
      chosen,
      tagMode,
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
    <Form.Text className="d-block text-body-secondary">
      <SiWikimediacommons /> <Text m={gm} k="excludesWikimedia" />
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
            <FaCamera /> <FaFilter /> <Text m={gm} k="filterModal.title" />
          </Modal.Title>
          <ManualHeaderButton chapter="photos" />
        </Modal.Header>

        <Modal.Body>
          {/* ReactTags names its input "<id>-input". */}
          <Form.Group controlId="tag-input" className="mb-3">
            <Form.Label>
              <Text m={gm} k="filterModal.tag" />
            </Form.Label>

            {/* At most one tag: picking another replaces it. */}
            <ReactTags
              id="tag"
              renderListBox={FittedListBox}
              renderOption={TagSuggestionOption}
              placeholderText={gm?.filterModal.tagSearch}
              noOptionsText={m?.general.noOptionsText}
              activateFirstOption
              deleteButtonText={m?.general.deleteButtonText}
              selected={selectedTags}
              suggestions={suggestions}
              suggestionsTransform={filterSuggestions}
              onAdd={handleTagAdd}
              onDelete={(i) => setChosen((prev) => prev.toSpliced(i, 1))}
              collapseOnSelect
              // Without the library's "remove" title, which would show
              // beside the hierarchy tooltip.
              renderTag={({
                classNames,
                tag: selected,
                title: _,
                ...props
              }) => {
                // The chosen tag's hierarchy and synonyms.
                const relation = optionByValue.get(
                  String(selected.value).slice(CHOSEN.length),
                )?.relation;

                return (
                  <LongPressTooltip
                    label={relation && <TagRelationLine relation={relation} />}
                    // False: counts as shown inline, so no tooltip opens.
                    hideLabel={relation !== undefined}
                  >
                    {({ props: tooltip }) => (
                      <button
                        type="button"
                        className={classNames.tag}
                        {...props}
                        {...tooltip}
                      >
                        <span className={classNames.tagName}>
                          {selected.label}
                        </span>
                      </button>
                    )}
                  </LongPressTooltip>
                );
              }}
            />

            {chosen.length > 1 && (
              <FitToggleButtonGroup
                type="radio"
                name="filt-tag-mode"
                className="mt-2"
                value={tagMode}
                onChange={(value: 'any' | 'all') => setTagMode(value)}
              >
                <ToggleButton
                  id="filt-tag-any"
                  value="any"
                  variant="outline-primary"
                >
                  <Text m={gm} k="filterModal.tagModeAny" />
                </ToggleButton>

                <ToggleButton
                  id="filt-tag-all"
                  value="all"
                  variant="outline-primary"
                >
                  <Text m={gm} k="filterModal.tagModeAll" />
                </ToggleButton>
              </FitToggleButtonGroup>
            )}

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
