import center from '@turf/center';
import { convertToDrawing, setTool } from 'fm3/actions/mainActions';
import {
  routePlannerSetFinish,
  routePlannerSetStart,
} from 'fm3/actions/routePlannerActions';
import {
  SearchResult,
  searchSelectResult,
  searchSetQuery,
  searchSetResults,
} from 'fm3/actions/searchActions';
import { fixedPopperConfig } from 'fm3/fixedPopperConfig';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useEffectiveChosenLanguage } from 'fm3/hooks/useEffectiveChosenLanguage';
import { useScrollClasses } from 'fm3/hooks/useScrollClasses';
import { useMessages } from 'fm3/l10nInjector';
import {
  getNameFromOsmElement,
  resolveGenericName,
} from 'fm3/osm/osmNameResolver';
import { osmTagToIconMapping } from 'fm3/osm/osmTagToIconMapping';
import { useOsmNameResolver } from 'fm3/osm/useOsmNameResolver';
import 'fm3/styles/search.scss';
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
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown, { type DropdownProps } from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { FaPencilAlt, FaPlay, FaSearch, FaStop, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

type Props = {
  hidden?: boolean;
  preventShortcut?: boolean;
};

const typeSymbol = {
  way: '─',
  node: '•',
  relation: '⎔',
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

  // const inProgress = useAppSelector((state) => state.search.inProgress);

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
      const result = results.find((item) => item.id === Number(eventKey));

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
                <Button
                  className="w-auto"
                  variant="secondary"
                  type="button"
                  title={m?.general.clear}
                  onClick={handleClearClick}
                >
                  <FaTimes />
                </Button>
              )}

              <Button
                variant="secondary"
                type="submit"
                title={m?.search.buttonTitle}
                disabled={!value}
              >
                <FaSearch />
              </Button>
            </InputGroup>
          </Dropdown.Toggle>

          <Dropdown.Menu
            className="fm-search-dropdown"
            popperConfig={fixedPopperConfig}
          >
            <div className="dropdown-long" ref={sc}>
              <div />

              {results.map((result) => (
                <Dropdown.Item
                  key={result.id}
                  eventKey={String(result.id)}
                  active={!!selectedResult && result.id === selectedResult.id}
                >
                  <Result value={result} />
                </Dropdown.Item>
              ))}
            </div>
          </Dropdown.Menu>
        </Dropdown>
      </Form>

      {selectedResult && !window.fmEmbedded && !hidden && (
        <>
          <ButtonGroup className="ms-1">
            <Button
              variant="secondary"
              title={m?.search.routeFrom}
              onClick={() => {
                dispatch(setTool('route-planner'));

                if (selectedResult.geojson) {
                  const c = center(selectedResult.geojson).geometry.coordinates;

                  dispatch(
                    routePlannerSetStart({
                      start: {
                        lat: c[1],
                        lon: c[0],
                      },
                    }),
                  );
                }
              }}
            >
              <FaPlay color="#32CD32" />
            </Button>

            <Button
              variant="secondary"
              title={m?.search.routeTo}
              onClick={() => {
                dispatch(setTool('route-planner'));

                if (selectedResult.geojson) {
                  const c = center(selectedResult.geojson).geometry.coordinates;

                  dispatch(
                    routePlannerSetFinish({
                      finish: {
                        lat: c[1],
                        lon: c[0],
                      },
                    }),
                  );
                }
              }}
            >
              <FaStop color="#FF6347" />
            </Button>
          </ButtonGroup>

          <Button
            className="ms-1"
            title={m?.general.convertToDrawing}
            variant="secondary"
            onClick={() => {
              console.log(selectedResult.geojson);

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
          >
            <FaPencilAlt />
          </Button>
        </>
      )}
    </>
  );
}

function Result({ value }: { value: SearchResult }) {
  const m = useMessages();

  const tags = value.tags ?? {};

  const gn = useOsmNameResolver(value.osmType, tags);

  const language = useEffectiveChosenLanguage();

  const name = getNameFromOsmElement(tags, language);

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
          {gn || m?.general.unnamed}
        </div>

        <div
          style={{
            opacity: 0.25,
          }}
        >
          {typeSymbol[value.osmType]}
        </div>
      </div>

      {name && <small className="ms-4 text-truncate">{name}</small>}
    </div>
  );
}
