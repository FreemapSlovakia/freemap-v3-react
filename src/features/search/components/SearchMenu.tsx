import { useMessages } from '@features/l10n/l10nInjector.js';
import { SourceName } from '@features/objects/components/SourceName.js';
import { isLocalSearchQuery } from '@features/search/localQuery.js';
import {
  getOsmAddress,
  getOsmName,
  resolveGenericName,
} from '@osm/osmNameResolver.js';
import { osmTagToIconMapping } from '@osm/osmTagToIconMapping.js';
import { useGenericNameResolver } from '@osm/useGenericNameResolver.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { OfflineBadge } from '@shared/components/OfflineBadge.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useEffectiveChosenLanguage } from '@shared/hooks/useEffectiveChosenLanguage.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import {
  featureIdsEqual,
  type OsmFeatureId,
  stringifyFeatureId,
} from '@shared/types/featureId.js';
import clsx from 'clsx';
import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  Fragment,
  forwardRef,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Button,
  ButtonGroup,
  Dropdown,
  type DropdownProps,
  Form,
  InputGroup,
} from 'react-bootstrap';
import {
  FaCaretDown,
  FaCaretUp,
  FaDrawPolygon,
  FaSearch,
} from 'react-icons/fa';
import { GoDotFill } from 'react-icons/go';
import { MdPolyline } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import {
  SEARCH_PROGRESS_ID,
  type SearchResult,
  type SearchSource,
  searchLimitStep,
  searchSelectResult,
  searchSetHover,
  searchSetQuery,
  searchSetResults,
  searchUnsetHover,
} from '../model/actions.js';
import classes from './SearchMenu.module.css';

type Props = {
  hidden?: boolean;
  preventShortcut?: boolean;
};

function preventDefault(e: { preventDefault: () => void }) {
  e.preventDefault();
}

/**
 * Focus that is not the box's to take: somewhere text goes, or a modal's own —
 * which is bounced straight back (`enforceFocus`), leaving the list showing
 * behind the backdrop and its `aria-expanded` swallowing the next map click.
 */
function holdsFocus(el: Element | null): boolean {
  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    (el instanceof HTMLElement && el.isContentEditable) ||
    Boolean(el?.closest('[role="dialog"], .modal'))
  );
}

/** Shorter than this suggests nothing, and searches nothing. */
const minQueryLength = 3;

/** Long enough that a typed word is one lookup rather than one per letter. */
const suggestDelayMs = 300;

const typeSymbol: Record<OsmFeatureId['elementType'], ReactNode> = {
  node: <GoDotFill />,
  way: <MdPolyline />,
  relation: <FaDrawPolygon />,
};

const wmsShapeSymbol: Record<string, ReactNode> = {
  Point: <GoDotFill />,
  MultiPoint: <GoDotFill />,
  LineString: <MdPolyline />,
  MultiLineString: <MdPolyline />,
  Polyline: <MdPolyline />,
  Polygon: <FaDrawPolygon />,
  MultiPolygon: <FaDrawPolygon />,
};

/**
 * A caret-less dropdown toggle for menus that are driven by an input inside
 * them. The toggle's `onClick` is dropped — the input's focus and the caret
 * button open and close the menu — but the rest of the props, `aria-expanded`
 * above all, must reach the DOM: `Main.tsx` swallows a click on the map while
 * `[aria-expanded=true]` is present anywhere, so a menu that hides it lets the
 * click that dismisses it act on the map as well.
 */
export const HideArrow = forwardRef<
  HTMLSpanElement,
  ComponentPropsWithoutRef<'span'>
>(({ children, className, onClick: _onClick, ...props }, ref) => {
  return (
    <span {...props} className={clsx(classes.noAfter, className)} ref={ref}>
      {children}
    </span>
  );
});

HideArrow.displayName = 'HideArrow';

export function SearchMenu({ hidden, preventShortcut }: Props): ReactElement {
  const m = useMessages();

  const online = useOnline();

  const dispatch = useDispatch();

  const results = useAppSelector((state) => state.search.results);

  const selection = useAppSelector((state) => state.main.selection);

  const query = useAppSelector((state) => state.search.query);

  const more = useAppSelector((state) => state.search.more);

  // A request already running would answer the same Show more twice, so it is
  // neither offered nor reachable until it lands.
  const searching = useAppSelector((state) =>
    state.progress.includes(SEARCH_PROGRESS_ID),
  );

  const [value, setValue] = useState(query);

  const [open, setOpen] = useState(false);

  // `more` describes the results in the store, so the box must be holding the
  // query they answer: Enter on a half-typed one would otherwise ask for a
  // longer page of something else, and land a list longer than it believes.
  const canShowMore = more && !searching && value === query;

  /**
   * What the box last asked for, which the store's `query` cannot answer:
   * emptying the box throws its results away but leaves `query` naming them,
   * so the same query pasted back in one step would be skipped as already
   * searched and the box would stay empty until Enter.
   */
  const askedRef = useRef(query);

  // How many the list is currently asking for. Show more raises it; anything
  // that changes the query puts it back to one page.
  const [limit, setLimit] = useState(searchLimitStep);

  useEffect(() => {
    // Only a query from somewhere else — a URL restore, say — belongs in the
    // box. Writing our own suggestion back into it reverts a keystroke that
    // lands between the dispatch and this effect.
    if (query !== askedRef.current) {
      setValue(query);
    }

    setLimit(searchLimitStep);

    // However the query changed — submitted here, restored from the URL, set
    // by picking a result — it has been asked and must not be suggested again.
    askedRef.current = query;
  }, [query]);

  // Offline the box still finds what the query itself carries; anything else
  // has to be asked of the geocoder, and only that goes dead.
  const needsGeocoder = !online && Boolean(value) && !isLocalSearchQuery(value);

  // Suggest while typing, skipping what has already been asked for.
  useEffect(() => {
    if (
      needsGeocoder ||
      value.length < minQueryLength ||
      value === askedRef.current
    ) {
      return;
    }

    const timeout = setTimeout(() => {
      // Re-checked on the way out: submitting between the keystroke and here
      // asks for this very query, and suggesting it again would answer the
      // committed search with a suggestion.
      if (value === askedRef.current) {
        return;
      }

      askedRef.current = value;

      dispatch(searchSetQuery({ query: value, autocomplete: true }));
    }, suggestDelayMs);

    return () => clearTimeout(timeout);
  }, [value, needsGeocoder, dispatch]);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const boxRef = useRef<HTMLDivElement | null>(null);

  const handleSearch = useCallback(
    (e: ChangeEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (value.length < minQueryLength) {
        return;
      }

      // Enter is Show more once there is more — the only thing left for it to
      // do on a query the suggestions have already answered, so a grown list is
      // not shrunk back to one page by committing it. A query the box has moved
      // on to starts at one page instead: how far the last one was grown says
      // nothing about this one.
      const next = canShowMore
        ? limit + searchLimitStep
        : value === query
          ? limit
          : searchLimitStep;

      dispatch(searchSetQuery({ query: value, limit: next }));

      setLimit(next);
    },
    [canShowMore, dispatch, limit, query, value],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { value } = e.currentTarget;

      setValue(value);

      // Only a query too short to suggest empties the list: above that the
      // suggestions replace it, and clearing first would flicker it shut.
      if (value.length < minQueryLength) {
        // The box holds no query any more, so nothing has been asked for —
        // whatever is typed next deserves a fresh look, the query just thrown
        // away included.
        askedRef.current = '';

        setLimit(searchLimitStep);

        // Takes the question back as well as the answers: it aborts a request
        // still in flight (`cancelActions`) and moves `search.query` on, so a
        // suggestion that already answered is refused instead of refilling the
        // list under an empty box. An empty query asks the geocoder nothing.
        if (query) {
          dispatch(searchSetQuery({ query: '' }));
        }

        if (results.length > 0) {
          dispatch(searchSetResults([]));
        }
      }
    },
    [dispatch, query, results.length],
  );

  const handleSelect = useCallback(
    (eventKey: string | null) => {
      if (!eventKey) {
        return;
      }

      const result = results.find(
        (item) => stringifyFeatureId(item.id) === eventKey,
      );

      if (result) {
        // Where a search ends now that suggestions answer most of them: an
        // Enter is the rarity, so counting one would count almost nothing.
        trackMatomo(['trackEvent', 'Search', 'pick', result.source]);

        dispatch(searchSelectResult({ result }));
      }

      setOpen(false);
    },
    [results, dispatch],
  );

  const showMore = useCallback(() => {
    const next = limit + searchLimitStep;

    setLimit(next);

    // Straight out, with no debounce and no `autocomplete`: this is asked for
    // rather than guessed at, so a failure is worth saying out loud.
    dispatch(searchSetQuery({ query: value, limit: next }));
  }, [dispatch, limit, value]);

  useEffect(() => {
    if (results.length) {
      const active = document.activeElement;

      if (!inputRef.current || active === inputRef.current) {
        setOpen(true);
      } else if (!holdsFocus(active)) {
        // Nothing is being typed into — the map, a button, or nothing at all
        // has the focus — so take it back and show what arrived. The map
        // counts: Leaflet's container is focusable, so map-details results
        // arrive with it holding the focus.
        inputRef.current.focus();
      }
      // Otherwise the user has moved on to something of their own. Suggestions
      // land a keystroke's delay plus a round trip later, so taking the caret
      // back here would pull it out of whatever they are filling in now.
    } else {
      setOpen(false);
      // setValue(''); TODO
    }
  }, [results]);

  useEffect(() => {
    if (hidden || preventShortcut) {
      return;
    }

    const handler = (e: KeyboardEvent) => {
      if (inputRef.current) {
        if (
          e.code === 'F3' ||
          ((e.ctrlKey || e.metaKey) && e.code === 'KeyF')
        ) {
          inputRef.current.focus();

          e.preventDefault();
        } else if (
          inputRef.current === document.activeElement &&
          e.code === 'Escape'
        ) {
          // Escape dismisses the result list first, and only then the input.
          if (open) {
            setOpen(false);
          } else {
            inputRef.current.blur();
          }

          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handler);

    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [hidden, preventShortcut, open]);

  // A row's mouse-leave doesn't fire when the list closes under the pointer —
  // by Escape, by a click on the map, or by the caret.
  useEffect(() => {
    if (!open) {
      dispatch(searchSetHover(null));
    }
  }, [open, dispatch]);

  // Only while the caret is in the box does Enter reach the form: arrowing
  // into the list moves it, and Enter then picks the row it landed on.
  const [inputFocused, setInputFocused] = useState(false);

  const handleInputFocus = useCallback(() => {
    setInputFocused(true);

    setOpen(results.length > 0);
  }, [results]);

  const handleInputBlur = useCallback(() => {
    setInputFocused(false);
  }, []);

  // Opening is driven by the input's focus and by arriving results; a request
  // to close is honoured whatever holds the focus — a click on the map leaves
  // it in the input, because Leaflet swallows the `mousedown`. Only a click on
  // the search box itself keeps the list up: editing the query shouldn't
  // dismiss it, and the caret has a handler of its own.
  const handleToggle: DropdownProps['onToggle'] = (isOpen, meta) => {
    if (isOpen) {
      return;
    }

    const target = meta.originalEvent?.target;

    if (
      meta.source === 'rootClose' &&
      target instanceof Node &&
      boxRef.current?.contains(target)
    ) {
      return;
    }

    setOpen(false);
  };

  // The caret toggles the list. Refocusing the input on close would reopen it
  // right away through `handleInputFocus`, so only opening touches the focus.
  const handleCaretClick = useCallback(() => {
    if (open) {
      setOpen(false);
    } else {
      setOpen(true);

      inputRef.current?.focus();
    }
  }, [open]);

  let prevSource: SearchSource | undefined;

  return (
    <Form onSubmit={handleSearch} style={{ display: hidden ? 'none' : '' }}>
      <Dropdown
        as={ButtonGroup}
        show={open}
        onSelect={handleSelect}
        onToggle={handleToggle}
      >
        <Dropdown.Toggle as={HideArrow}>
          <InputGroup className="flex-nowrap" ref={boxRef}>
            <Form.Control
              type="search"
              className={classes.searchInput}
              onChange={handleChange}
              value={value}
              placeholder={m?.search.placeholder}
              ref={inputRef}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              // The browser offers the queries submitted here before, in a list
              // of its own that covers the suggestions with stale entries.
              autoComplete="off"
            />

            {results.length ? (
              <Button variant="secondary" onClick={handleCaretClick}>
                {open ? <FaCaretUp /> : <FaCaretDown />}
              </Button>
            ) : needsGeocoder ? (
              // Coordinates, a bounding box, tile numbers and pasted GeoJSON are
              // all read here, so the box works offline; a query only the
              // geocoder could answer takes the mark in place of the button —
              // which is also what stops it being submitted.
              <InputGroup.Text>
                <OfflineBadge hint={m?.search.offlineHint} />
              </InputGroup.Text>
            ) : (
              <LongPressTooltip label={m?.search.buttonTitle}>
                {({ props }) => (
                  <Button
                    variant="secondary"
                    type="submit"
                    disabled={!value}
                    {...props}
                  >
                    <FaSearch />
                  </Button>
                )}
              </LongPressTooltip>
            )}
          </InputGroup>
        </Dropdown.Toggle>

        <FmDropdownMenu className={classes.searchDropdown}>
          {results.map((result) => {
            const id = stringifyFeatureId(result.id);

            const divider =
              !(
                [
                  'nominatim-forward',
                  'bbox',
                  'coords',
                  'geojson',
                ] as SearchSource[]
              ).includes(result.source) && prevSource !== result.source ? (
                <div className="dropdown-caption-divider">
                  <SourceName result={result} />
                </div>
              ) : null;

            prevSource = result.source;

            return (
              <Fragment key={id}>
                {divider}

                <Dropdown.Item
                  eventKey={id}
                  onClick={preventDefault}
                  onMouseEnter={() => dispatch(searchSetHover(result))}
                  onMouseLeave={() => dispatch(searchUnsetHover(result.id))}
                  // Arrowing through the list previews too, the focus being
                  // where the pointer would be.
                  onFocus={() => dispatch(searchSetHover(result))}
                  onBlur={() => dispatch(searchUnsetHover(result.id))}
                  {...(result.id.type === 'osm'
                    ? {
                        href: `#osm-${result.id.elementType}=${result.id.id}`,
                      }
                    : ({ as: 'button', type: 'button' } as const))}
                  active={
                    selection?.type === 'search' &&
                    featureIdsEqual(result.id, selection.id)
                  }
                >
                  <Result value={result} />
                </Dropdown.Item>
              </Fragment>
            );
          })}

          {canShowMore && (
            <Dropdown.Item
              as="button"
              type="button"
              // The pointer acts on mousedown, because the click that follows
              // is not reliably delivered: with the caret outside the box —
              // which picking a result leaves it — the menu's own focus
              // handling swallows roughly every other one. `preventDefault`
              // keeps the focus wherever it was rather than moving it here.
              onMouseDown={(e) => {
                if (e.button !== 0) {
                  return;
                }

                e.preventDefault();

                showMore();
              }}
              // A click carrying no pointer (`detail === 0`) is the keyboard
              // activating the row, which arrowing down from the results must
              // still reach. One with a pointer behind it has already been
              // served above.
              onClick={(e) => {
                e.preventDefault();

                e.stopPropagation();

                if (e.detail === 0) {
                  showMore();
                }
              }}
            >
              <small>{m?.search.showMore}</small>

              {inputFocused && (
                <>
                  {' '}
                  <kbd>Enter</kbd>
                </>
              )}
            </Dropdown.Item>
          )}
        </FmDropdownMenu>
      </Dropdown>
    </Form>
  );
}

function Result({ value }: { value: SearchResult }) {
  const m = useMessages();

  const tags = value.geojson.properties ?? {};

  const genericName = useGenericNameResolver(value);

  const language = useEffectiveChosenLanguage();

  // One shape for every source: what it is called, then what kind of thing it
  // is, then where it is. `getNameFromOsmElement` would fold the last into the
  // first — an element with only `addr:*` tags reads as if it were named after
  // its address — so the two are taken apart here.
  const name = value.address
    ? getOsmName(tags, language)
    : value.displayName || getOsmName(tags, language) || tags['ref'];

  const address = value.address ?? getOsmAddress(tags);

  const img = resolveGenericName(osmTagToIconMapping, tags);

  return (
    <div className={clsx('d-flex flex-column mx-n2', classes.result)}>
      <div className="d-flex gap-2 align-items-center">
        {img.length > 0 ? (
          <img src={img[0]} style={{ width: '1em', height: '1em' }} alt="" />
        ) : (
          <span
            style={{
              width: '1em',
              height: '1em',
              display: 'inline-block',
              opacity: 0.25,
              backgroundColor: 'gray',
            }}
            className="flex-shrink-0"
          />
        )}

        {/* The name carries the emphasis, so the kind of thing reads the same
            whether it follows one or stands as the whole row — a list of
            unnamed features would otherwise be muted from top to bottom. */}
        <div className="flex-grow-1 text-truncate">
          {name && <span className="fw-semibold">{name}</span>}

          {genericName ? (
            <span className={clsx(name && 'ms-2')}>{genericName}</span>
          ) : (
            !name && m?.general.unknown
          )}
        </div>

        <div className="flex-shrink-0" style={{ opacity: 0.25 }}>
          {value.id.type === 'osm'
            ? typeSymbol[value.id.elementType]
            : value.id.type === 'wms' && tags['Shape']
              ? (wmsShapeSymbol[tags['Shape'] as string] ?? null)
              : null}
        </div>
      </div>

      {address && <small className="ms-4 text-truncate">{address}</small>}
    </div>
  );
}
