import { selectFeature } from 'fm3/actions/mainActions';
import {
  routePlannerSetFinish,
  routePlannerSetStart,
} from 'fm3/actions/routePlannerActions';
import {
  searchSelectResult,
  searchSetQuery,
  searchSetResults,
} from 'fm3/actions/searchActions';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import 'fm3/styles/search.scss';
import {
  ChangeEvent,
  FocusEvent,
  MouseEvent,
  ReactElement,
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
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from './FontAwesomeIcon';

type Props = {
  hidden?: boolean;
  preventShortcut?: boolean;
};

export function SearchMenu({ hidden, preventShortcut }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const results = useSelector((state: RootState) => state.search.results);

  const selectedResult = useSelector(
    (state: RootState) => state.search.selectedResult,
  );

  const searchSeq = useSelector((state: RootState) => state.search.searchSeq);

  // const inProgress = useSelector((state: RootState) => state.search.inProgress);

  const embed = window.self !== window.top;

  const [value, setValue] = useState('');

  const [open, setOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSearch = useCallback(
    (e: ChangeEvent<HTMLFormElement>) => {
      e.preventDefault();

      dispatch(searchSetQuery({ query: value }));
    },
    [dispatch, value],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setValue(e.currentTarget.value);

      if (results.length > 0) {
        dispatch(searchSetResults([]));
      }
    },
    [setValue, dispatch, results],
  );

  const handleSelect = useCallback(
    (eventKey) => {
      const found = results.find((item) => item.id === Number(eventKey));

      if (found) {
        dispatch(searchSelectResult(found));
      }

      if (selectedResult?.id === Number(eventKey)) {
        setOpen(false);
      }
    },
    [results, dispatch, selectedResult],
  );

  const f: DropdownProps['onToggle'] = (open, _, { source }) => {
    if (!open && source !== 'select') {
      setOpen(false);
    } else if (open && results.length > 0) {
      setOpen(true);
    }
  };

  const handleToggle = useCallback(f, [setOpen, results]);

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
  }, [results, setOpen, inputRef]);

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
  }, [hidden, inputRef, preventShortcut]);

  const handleInputFocus = useCallback((e: FocusEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  }, []);

  const handleClearClick = useCallback(
    (e: MouseEvent<HTMLInputElement>) => {
      e.stopPropagation();
      dispatch(searchSelectResult(null));
      setValue('');
    },
    [dispatch],
  );

  return (
    <span style={{ display: hidden ? 'none' : 'inline' }}>
      <Form inline onSubmit={handleSearch}>
        <Dropdown
          as={ButtonGroup}
          // className="dropdown-long"
          show={open}
          onToggle={handleToggle}
        >
          <InputGroup>
            <FormControl
              className="fm-search-input"
              onChange={handleChange}
              value={value}
              placeholder="Brusno"
              ref={inputRef}
              onFocus={handleInputFocus}
            />
            <InputGroup.Append style={{ width: 'auto' }}>
              {!!selectedResult && (
                <Button
                  type="button"
                  title={m?.general.clear}
                  onClick={handleClearClick}
                >
                  <FontAwesomeIcon icon="times" />
                </Button>
              )}
              <Button
                variant="secondary"
                type="submit"
                title={m?.search.buttonTitle}
                disabled={!value}
              >
                <FontAwesomeIcon icon="search" />
              </Button>
            </InputGroup.Append>
          </InputGroup>
          <Dropdown.Menu
            key={searchSeq}
            className="fm-search-dropdown"
            onSelect={handleSelect}
          >
            {results.map((result) => (
              <Dropdown.Item
                key={result.id}
                eventKey={String(result.id)}
                active={!!selectedResult && result.id === selectedResult.id}
              >
                {result.label}
                <br />
                {!!(result.class && result.type) && (
                  <small>
                    {result.class}={result.type}
                  </small>
                )}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>{' '}
      </Form>{' '}
      {selectedResult && !embed && (
        <ButtonGroup>
          <Button
            variant="secondary"
            title={m?.search.routeFrom}
            onClick={() => {
              dispatch(selectFeature({ type: 'route-planner' }));

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
            <FontAwesomeIcon icon="play" style={{ color: '#32CD32' }} />
          </Button>
          <Button
            variant="secondary"
            title={m?.search.routeTo}
            onClick={() => {
              dispatch(selectFeature({ type: 'route-planner' }));

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
            <FontAwesomeIcon icon="stop" style={{ color: '#FF6347' }} />
          </Button>
        </ButtonGroup>
      )}
    </span>
  );
}
