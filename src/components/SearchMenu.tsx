import { setTool } from 'fm3/actions/mainActions';
import {
  routePlannerSetFinish,
  routePlannerSetStart,
} from 'fm3/actions/routePlannerActions';
import {
  searchSelectResult,
  searchSetQuery,
  searchSetResults,
} from 'fm3/actions/searchActions';
import { useScrollClasses } from 'fm3/hooks/scrollClassesHook';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import 'fm3/styles/search.scss';
import {
  ChangeEvent,
  Children,
  forwardRef,
  MouseEvent,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown, { DropdownProps } from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import SafeAnchor from 'react-bootstrap/SafeAnchor';
import { FaPlay, FaSearch, FaStop, FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';

type Props = {
  hidden?: boolean;
  preventShortcut?: boolean;
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

  const results = useSelector((state: RootState) => state.search.results);

  const selectedResult = useSelector(
    (state: RootState) => state.search.selectedResult,
  );

  const searchSeq = useSelector((state: RootState) => state.search.searchSeq);

  // const inProgress = useSelector((state: RootState) => state.search.inProgress);

  const tRef = useRef<number>();

  const embed = window.self !== window.top;

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
    (eventKey: string | null, _: unknown, preserve?: boolean) => {
      if (tRef.current) {
        window.clearTimeout(tRef.current);
      }

      tRef.current = window.setTimeout(
        () => {
          const found = results.find((item) => item.id === Number(eventKey));

          if (found) {
            dispatch(searchSelectResult(found));
          }

          if (!preserve) {
            setOpen(false);
          }
        },
        preserve ? 300 : 0,
      );
    },
    [results, dispatch],
  );

  useEffect(() => {
    if (tRef.current) {
      window.clearTimeout(tRef.current);

      tRef.current = undefined;
    }
  }, [open]);

  useEffect(() => {
    if (results.length) {
      setOpen(true);
      if (inputRef.current) {
        inputRef.current.focus();
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

  const HoverableMenuItem = useMemo(
    () =>
      forwardRef<HTMLAnchorElement, { children: ReactNode }>(function HiddenInt(
        { children, ...props },
        ref,
      ) {
        function handleFocus() {
          const ch = Children.only(children);

          handleSelect((ch as any).props['data-id'], undefined, true);
        }

        return (
          <SafeAnchor
            ref={ref}
            {...props}
            onFocus={handleFocus}
            onMouseMove={handleFocus}
          >
            {children}
          </SafeAnchor>
        );
      }),
    [handleSelect],
  );

  // ugly hack not to close dropdown on open
  const justOpenedRef = useRef(false);

  const handleInputFocus = useCallback(() => {
    setOpen(results.length > 0);
    justOpenedRef.current = true;
  }, [results]);

  const handleToggle: DropdownProps['onToggle'] = (isOpen, e) => {
    if (justOpenedRef.current) {
      justOpenedRef.current = false;
    } else if (!isOpen) {
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
                  as={HoverableMenuItem}
                >
                  <span data-id={result.id}>
                    {result.label}
                    <br />
                    {!!(result.class && result.type) && (
                      <small>
                        {result.class}={result.type}
                      </small>
                    )}
                  </span>
                </Dropdown.Item>
              ))}
            </div>
          </Dropdown.Menu>
        </Dropdown>
      </Form>
      {selectedResult && !embed && !hidden && (
        <ButtonGroup className="ml-1">
          <Button
            variant="secondary"
            title={m?.search.routeFrom}
            onClick={() => {
              dispatch(setTool('route-planner'));

              dispatch(
                routePlannerSetStart({
                  start: {
                    lat: selectedResult.lat,
                    lon: selectedResult.lon,
                  },
                }),
              );
            }}
          >
            <FaPlay color="#32CD32" />
          </Button>
          <Button
            variant="secondary"
            title={m?.search.routeTo}
            onClick={() => {
              dispatch(setTool('route-planner'));

              dispatch(
                routePlannerSetFinish({
                  finish: {
                    lat: selectedResult.lat,
                    lon: selectedResult.lon,
                  },
                }),
              );
            }}
          >
            <FaStop color="#FF6347" />
          </Button>
        </ButtonGroup>
      )}
    </>
  );
}
