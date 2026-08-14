import { useMessages } from '@features/l10n/l10nInjector.js';
import { SourceName } from '@features/objects/components/SourceName.js';
import { isLocalSearchQuery } from '@features/search/localQuery.js';
import {
  getNameFromOsmElement,
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
  type SearchResult,
  type SearchSource,
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

  const [value, setValue] = useState(query);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    setValue(query);
  }, [query]);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const boxRef = useRef<HTMLDivElement | null>(null);

  const handleSearch = useCallback(
    (e: ChangeEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (value.length > 2) {
        dispatch(searchSetQuery({ query: value }));
      }
    },
    [dispatch, value],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { value } = e.currentTarget;

      setValue(value);

      if (results.length > 0) {
        dispatch(searchSetResults([]));
      }
    },
    [dispatch, results.length],
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
        dispatch(searchSelectResult({ result }));
      }

      setOpen(false);
    },
    [results, dispatch],
  );

  useEffect(() => {
    if (results.length) {
      if (!inputRef.current || document.activeElement === inputRef.current) {
        setOpen(true);
      } else {
        inputRef.current?.focus();
      }
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

  const handleInputFocus = useCallback(() => {
    setOpen(results.length > 0);
  }, [results]);

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

  // Offline the box still finds what the query itself carries; anything else
  // has to be asked of the geocoder, and only that goes dead.
  const needsGeocoder = !online && Boolean(value) && !isLocalSearchQuery(value);

  let prevSource: SearchSource | undefined;

  return (
    <Form
      onSubmit={handleSearch}
      style={{ display: hidden ? 'none' : '' }}
      className="ms-1"
    >
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

  const name = value.displayName || getNameFromOsmElement(tags, language);

  const img = resolveGenericName(osmTagToIconMapping, tags);

  return (
    <div className="d-flex flex-column mx-n2">
      <div className="d-flex f-gap-2 align-items-center">
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

        <div className="flex-grow-1 text-truncate">
          {genericName || m?.general.unnamed}
        </div>

        <div style={{ opacity: 0.25 }}>
          {value.id.type === 'osm'
            ? typeSymbol[value.id.elementType]
            : value.id.type === 'wms' && tags['Shape']
              ? (wmsShapeSymbol[tags['Shape'] as string] ?? null)
              : null}
        </div>
      </div>

      {name && <small className="ms-4 text-truncate">{name}</small>}
    </div>
  );
}
