import { center } from '@turf/center';
import {
  ChangeEvent,
  forwardRef,
  MouseEvent,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Button,
  ButtonGroup,
  Dropdown,
  Form,
  InputGroup,
  type DropdownProps,
} from 'react-bootstrap';
import {
  FaDrawPolygon,
  FaPencilAlt,
  FaPlay,
  FaSearch,
  FaStop,
  FaTimes,
} from 'react-icons/fa';
import { GoDotFill } from 'react-icons/go';
import { MdPolyline } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { convertToDrawing, setTool } from '../actions/mainActions.js';
import {
  routePlannerSetFinish,
  routePlannerSetStart,
} from '../actions/routePlannerActions.js';
import {
  SearchResult,
  searchSelectResult,
  searchSetQuery,
  searchSetResults,
} from '../actions/searchActions.js';
import { fixedPopperConfig } from '../fixedPopperConfig.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useEffectiveChosenLanguage } from '../hooks/useEffectiveChosenLanguage.js';
import { useScrollClasses } from '../hooks/useScrollClasses.js';
import { useMessages } from '../l10nInjector.js';
import {
  getNameFromOsmElement,
  resolveGenericName,
} from '../osm/osmNameResolver.js';
import { osmTagToIconMapping } from '../osm/osmTagToIconMapping.js';
import { useOsmNameResolver } from '../osm/useOsmNameResolver.js';
import '../styles/search.scss';
import { FeatureId, featureIdsEqual } from '../types/featureId.js';
import { LongPressTooltip } from './LongPressTooltip.js';

type Props = {
  hidden?: boolean;
  preventShortcut?: boolean;
};

const typeSymbol = {
  way: <MdPolyline />,
  node: <GoDotFill />,
  relation: <FaDrawPolygon />,
  other: '',
};

export const HideArrow = forwardRef<HTMLSpanElement, { children: ReactNode }>(
  ({ children }, ref) => {
    return (
      <span className="fm-no-after" ref={ref}>
        {children}
      </span>
    );
  },
);

HideArrow.displayName = 'HideArrow';

export function SearchMenu({ hidden, preventShortcut }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const results = useAppSelector((state) => state.search.results);

  const selectedResult = useAppSelector((state) => state.search.selectedResult);

  const [value, setValue] = useState('');

  const [open, setOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

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

      const id: FeatureId = JSON.parse(eventKey);

      const result = results.find((item) => featureIdsEqual(item.id, id));

      if (result) {
        dispatch(searchSelectResult({ result, showToast: result.showToast }));
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
          inputRef.current.blur();

          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handler);

    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [hidden, preventShortcut]);

  const handleClearClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      dispatch(searchSelectResult(null));

      dispatch(searchSetResults([]));

      setValue('');
    },
    [dispatch],
  );

  const handleInputFocus = useCallback(() => {
    setOpen(results.length > 0);
  }, [results]);

  const handleToggle: DropdownProps['onToggle'] = (isOpen) => {
    if (document.activeElement !== inputRef.current && !isOpen) {
      setOpen(false);
    }
  };

  const sc = useScrollClasses('vertical');

  return (
    <>
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
            <InputGroup className="flex-nowrap">
              <Form.Control
                type="search"
                className="fm-search-input"
                onChange={handleChange}
                value={value}
                placeholder={m?.search.placeholder}
                ref={inputRef}
                onFocus={handleInputFocus}
              />

              {!!selectedResult && (
                <LongPressTooltip label={m?.general.clear}>
                  {({ props }) => (
                    <Button
                      className="w-auto"
                      variant="secondary"
                      type="button"
                      onClick={handleClearClick}
                      {...props}
                    >
                      <FaTimes />
                    </Button>
                  )}
                </LongPressTooltip>
              )}

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
            </InputGroup>
          </Dropdown.Toggle>

          <Dropdown.Menu
            className="fm-search-dropdown fm-dropdown-with-scroller"
            popperConfig={fixedPopperConfig}
          >
            <div className="dropdown-long" ref={sc}>
              <div />

              {results.map((result) => {
                const id = JSON.stringify(result.id);

                return (
                  <Dropdown.Item
                    key={id}
                    eventKey={id}
                    active={
                      !!selectedResult &&
                      featureIdsEqual(result.id, selectedResult.id)
                    }
                  >
                    <Result value={result} />
                  </Dropdown.Item>
                );
              })}
            </div>
          </Dropdown.Menu>
        </Dropdown>
      </Form>
      {selectedResult && !window.fmEmbedded && !hidden && (
        <>
          <ButtonGroup className="ms-1">
            <LongPressTooltip label={m?.search.routeFrom}>
              {({ props }) => (
                <Button
                  variant="secondary"
                  {...props}
                  onClick={() => {
                    dispatch(setTool('route-planner'));

                    if (selectedResult.geojson) {
                      const c = center(selectedResult.geojson).geometry
                        .coordinates;

                      dispatch(
                        routePlannerSetStart({
                          lat: c[1],
                          lon: c[0],
                        }),
                      );
                    }
                  }}
                >
                  <FaPlay color="#32CD32" />
                </Button>
              )}
            </LongPressTooltip>

            <LongPressTooltip label={m?.search.routeTo}>
              {({ props }) => (
                <Button
                  variant="secondary"
                  onClick={() => {
                    dispatch(setTool('route-planner'));

                    if (selectedResult.geojson) {
                      const c = center(selectedResult.geojson).geometry
                        .coordinates;

                      dispatch(
                        routePlannerSetFinish({
                          lat: c[1],
                          lon: c[0],
                        }),
                      );
                    }
                  }}
                  {...props}
                >
                  <FaStop color="#FF6347" />
                </Button>
              )}
            </LongPressTooltip>
          </ButtonGroup>

          <LongPressTooltip label={m?.general.convertToDrawing}>
            {({ props }) => (
              <Button
                className="ms-1"
                variant="secondary"
                onClick={() => {
                  const ask =
                    (selectedResult.geojson?.type === 'FeatureCollection' &&
                      selectedResult.geojson.features.some(
                        (feature) => !feature.geometry.type.endsWith('Point'),
                      )) ||
                    (selectedResult.geojson?.type === 'Feature' &&
                      !selectedResult.geojson.geometry.type.endsWith('Point'));

                  const tolerance = ask
                    ? window.prompt(m?.general.simplifyPrompt, '50')
                    : '50';

                  if (tolerance !== null) {
                    dispatch(
                      convertToDrawing({
                        type: 'search-result',
                        tolerance: Number(tolerance || '0') / 100_000,
                      }),
                    );
                  }
                }}
                {...props}
              >
                <FaPencilAlt />
              </Button>
            )}
          </LongPressTooltip>
        </>
      )}
    </>
  );
}

function Result({ value }: { value: SearchResult }) {
  const m = useMessages();

  const tags =
    (value.geojson.type === 'Feature'
      ? value.geojson.properties
      : value.geojson.metadata) ?? {};

  const genericName =
    value.id.type === 'other'
      ? undefined
      : useOsmNameResolver(value.id.type, tags);

  const language = useEffectiveChosenLanguage();

  const name = tags['display_name'] || getNameFromOsmElement(tags, language);

  const img = resolveGenericName(osmTagToIconMapping, tags);

  return (
    <div className="d-flex flex-column mx-n2">
      <div className="d-flex f-gap-2 align-items-center">
        {img.length > 0 ? (
          <img src={img[0]} style={{ width: '1em', height: '1em' }} />
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

        <div
          style={{
            opacity: 0.25,
          }}
        >
          {typeSymbol[value.id.type]}
        </div>
      </div>

      {name && <small className="ms-4 text-truncate">{name}</small>}
    </div>
  );
}
