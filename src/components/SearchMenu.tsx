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
import { useScrollClasses } from 'fm3/hooks/scrollClassesHook';
import { useMessages } from 'fm3/l10nInjector';
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
import Dropdown, { DropdownProps } from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import { FaPencilAlt, FaPlay, FaSearch, FaStop, FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';

type Props = {
  hidden?: boolean;
  preventShortcut?: boolean;
};

const typeSymbol = {
  way: '─',
  node: '•',
  relation: '▦',
};

export const HideArrow = forwardRef<HTMLSpanElement, { children: ReactNode }>(
  function HiddenInt({ children }, ref) {
    return (
      <span className="fm-no-after" ref={ref}>
        {children}
      </span>
    );
  },
);

export function SearchMenu({ hidden, preventShortcut }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const results = useSelector((state) => state.search.results);

  const selectedResult = useSelector((state) => state.search.selectedResult);

  const searchSeq = useSelector((state) => state.search.searchSeq);

  // const inProgress = useSelector((state) => state.search.inProgress);

  const [value, setValue] = useState('');

  const [open, setOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const callback = useDebouncedCallback((query: string) => {
    if (query.length < 3) {
      if (results.length > 0) {
        dispatch(searchSetResults([]));
      }
    } else {
      dispatch(searchSetQuery({ query }));
    }
  }, 1000);

  const flush = callback.flush;

  const handleSearch = useCallback(
    (e: ChangeEvent<HTMLFormElement>) => {
      e.preventDefault();

      flush();
    },
    [flush],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { value } = e.currentTarget;

      setValue(value);

      callback(value);
    },
    [callback],
  );

  const handleSelect = useCallback(
    (eventKey: string | null) => {
      const result = results.find((item) => item.id === Number(eventKey));

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
        } else if (e.code === 'Escape') {
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
    (e: MouseEvent<HTMLInputElement>) => {
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

  const handleToggle: DropdownProps['onToggle'] = (isOpen, e) => {
    if (document.activeElement !== inputRef.current && !isOpen) {
      setOpen(false);

      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  };

  const sc = useScrollClasses('vertical');

  return (
    <>
      <Form
        inline
        onSubmit={handleSearch}
        style={{ display: hidden ? 'none' : '' }}
      >
        <Dropdown
          as={ButtonGroup}
          show={open}
          onSelect={handleSelect}
          onToggle={handleToggle}
        >
          <Dropdown.Toggle as={HideArrow}>
            <InputGroup className="flex-nowrap">
              <FormControl
                className="fm-search-input"
                onChange={handleChange}
                value={value}
                placeholder={m?.search.placeholder}
                ref={inputRef}
                onFocus={handleInputFocus}
              />
              <InputGroup.Append className="w-auto">
                {!!selectedResult && (
                  <Button
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
              </InputGroup.Append>
            </InputGroup>
          </Dropdown.Toggle>
          <Dropdown.Menu
            key={searchSeq}
            className="fm-search-dropdown"
            popperConfig={{
              strategy: 'fixed',
            }}
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
          <ButtonGroup className="ml-1">
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
            className="ml-1"
            title={m?.general.convertToDrawing}
            variant="secondary"
            onClick={() =>
              dispatch(convertToDrawing({ type: 'search-result' }))
            }
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

  const subjectAndName = useOsmNameResolver(value.osmType, value.tags ?? {});

  return (
    <span>
      {typeSymbol[value.osmType]} {subjectAndName?.[1] || m?.general.unnamed}
      <br />
      <small>{subjectAndName?.[0]}</small>
    </span>
  );
}
