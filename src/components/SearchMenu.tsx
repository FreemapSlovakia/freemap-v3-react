import {
  useCallback,
  useState,
  useEffect,
  useRef,
  MouseEvent,
  ReactElement,
  FocusEvent,
  ChangeEvent,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  searchSetQuery,
  searchSelectResult,
  searchSetResults,
} from 'fm3/actions/searchActions';
import { selectFeature } from 'fm3/actions/mainActions';
import {
  routePlannerSetStart,
  routePlannerSetFinish,
} from 'fm3/actions/routePlannerActions';
import { useMessages } from 'fm3/l10nInjector';

import 'fm3/styles/search.scss';
import { RootState } from 'fm3/storeCreator';
import {
  FormControl,
  FormGroup,
  Form,
  Dropdown,
  InputGroup,
  Button,
  ButtonGroup,
} from 'react-bootstrap';
import { FontAwesomeIcon } from './FontAwesomeIcon';
import { KEY_F3, KEY_F, KEY_ESCAPE } from 'keycode-js';
import DropdownItem from 'react-bootstrap/esm/DropdownItem';

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

  const FormGroup2 = FormGroup as any; // hacked missing attribute "bsRole" in type

  const handleSelect = useCallback(
    (eventKey: unknown) => {
      const found = results.find((item) => item.id === eventKey);

      if (found) {
        dispatch(searchSelectResult(found));
      }

      if (selectedResult?.id === eventKey) {
        setOpen(false);
      }
    },
    [results, dispatch, selectedResult],
  );

  const f: DropdownBaseProps['onToggle'] = (open, _, { source }) => {
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
          e.keyCode === KEY_F3 ||
          ((e.ctrlKey || e.metaKey) && e.keyCode === KEY_F)
        ) {
          inputRef.current.focus();
          e.preventDefault();
        } else if (e.keyCode === KEY_ESCAPE) {
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
          // className="dropdown-long"
          id="objectsMenuDropdown"
          open={open}
          onToggle={handleToggle}
        >
          <FormGroup2 bsRole="toggle">
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
                  type="submit"
                  title={m?.search.buttonTitle}
                  disabled={!value}
                >
                  <FontAwesomeIcon icon="search" />
                </Button>
              </InputGroup.Append>
            </InputGroup>
          </FormGroup2>
          <Dropdown.Menu key={searchSeq} className="fm-search-dropdown">
            {results.map((result) => (
              <DropdownItem
                key={result.id}
                eventKey={String(result.id)}
                onSelect={handleSelect}
                active={!!selectedResult && result.id === selectedResult.id}
              >
                {result.label}
                <br />
                {!!(result.class && result.type) && (
                  <small>
                    {result.class}={result.type}
                  </small>
                )}
              </DropdownItem>
            ))}
          </Dropdown.Menu>
        </Dropdown>{' '}
      </Form>{' '}
      {selectedResult && !embed && (
        <ButtonGroup>
          <Button
            title={m?.search.routeFrom}
            onClick={() => {
              const start = {
                lat: selectedResult.lat,
                lon: selectedResult.lon,
              };

              dispatch(selectFeature({ type: 'route-planner' }));

              dispatch(routePlannerSetStart({ start }));
            }}
          >
            <Glyphicon glyph="triangle-right" style={{ color: '#32CD32' }} />
          </Button>
          <Button
            title={m?.search.routeTo}
            onClick={() => {
              const finish = {
                lat: selectedResult.lat,
                lon: selectedResult.lon,
              };

              dispatch(selectFeature({ type: 'route-planner' }));

              dispatch(routePlannerSetFinish({ finish }));
            }}
          >
            <Glyphicon glyph="record" style={{ color: '#FF6347' }} />
          </Button>
        </ButtonGroup>
      )}
    </span>
  );
}
