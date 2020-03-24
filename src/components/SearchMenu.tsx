import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  MouseEvent,
} from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import {
  searchSetQuery,
  searchSelectResult,
  SearchResult,
  searchSetResults,
} from 'fm3/actions/searchActions';
import { selectFeature } from 'fm3/actions/mainActions';
import {
  routePlannerSetStart,
  routePlannerSetFinish,
} from 'fm3/actions/routePlannerActions';
import { withTranslator, Translator } from 'fm3/l10nInjector';

import 'fm3/styles/search.scss';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';
import {
  FormControl,
  FormGroup,
  Form,
  Dropdown,
  MenuItem,
  InputGroup,
} from 'react-bootstrap';
import { FontAwesomeIcon } from './FontAwesomeIcon';
import { KEY_F3, KEY_F, KEY_ESCAPE } from 'keycode-js';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
    hidden?: boolean;
    preventShortcut?: boolean;
  };

const SearchMenuInt: React.FC<Props> = ({
  onResultSelect,
  onRoutePlannerWithStartInit,
  onRoutePlannerWithFinishInit,
  selectedResult,
  onDoSearch,
  results,
  onModify,
  searchSeq,
  // inProgress,
  t,
  hidden,
  preventShortcut,
}) => {
  const embed = window.self !== window.top;

  const [value, setValue] = useState('');

  const [open, setOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSearch = useCallback(
    (e: React.FormEvent<Form>) => {
      e.preventDefault();
      onDoSearch(value);
    },
    [onDoSearch, value],
  );

  const handleChange = useCallback(
    (e: React.FormEvent<FormControl>) => {
      setValue((e.target as HTMLInputElement).value);
      if (results.length > 0) {
        onModify();
      }
    },
    [setValue, onModify, results],
  );

  const FormGroup2 = FormGroup as any; // hacked missing attribute "bsRole" in type

  const handleSelect = useCallback(
    (eventKey: any) => {
      const found = results.find((item) => item.id === eventKey);
      if (found) {
        onResultSelect(found);
      }
      if (selectedResult?.id === eventKey) {
        setOpen(false);
      }
    },
    [results, onResultSelect, selectedResult],
  );

  const handleToggle = useCallback(
    (open: any, _: any, { source }: any) => {
      if (!open && source !== 'select') {
        setOpen(false);
      } else if (open && results.length > 0) {
        setOpen(true);
      }
    },
    [setOpen, results],
  );

  const setInputRef = useCallback(
    (ref: HTMLInputElement | null) => {
      inputRef.current = ref;
    },
    [inputRef],
  );

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

  const handleInputFocus = useCallback((e: React.FocusEvent<FormControl>) => {
    ((e.target as any) as HTMLInputElement).select();
  }, []);

  const handleClearClick = useCallback(
    (e: MouseEvent<Button>) => {
      e.stopPropagation();
      onResultSelect(null);
      setValue('');
    },
    [onResultSelect],
  );

  return (
    <span style={{ display: hidden ? 'none' : 'inline' }}>
      <Form inline onSubmit={handleSearch}>
        <Dropdown
          // className="dropdown-long"
          id="objectsMenuDropdown"
          open={open}
          onToggle={handleToggle as any}
        >
          <FormGroup2 bsRole="toggle">
            <InputGroup>
              <FormControl
                className="fm-search-input"
                onChange={handleChange}
                value={value}
                placeholder="Brusno"
                inputRef={setInputRef}
                onFocus={handleInputFocus}
              />
              <InputGroup.Button style={{ width: 'auto' }}>
                {!!selectedResult && (
                  <Button
                    type="button"
                    title={t('general.clear')}
                    onClick={handleClearClick}
                  >
                    <FontAwesomeIcon icon="times" />
                  </Button>
                )}
                <Button
                  type="submit"
                  title={t('search.buttonTitle')}
                  disabled={!value}
                >
                  <FontAwesomeIcon icon="search" />
                </Button>
              </InputGroup.Button>
            </InputGroup>
          </FormGroup2>
          <Dropdown.Menu key={searchSeq} className="fm-search-dropdown">
            {results.map((result) => (
              <MenuItem
                key={result.id}
                eventKey={result.id}
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
              </MenuItem>
            ))}
          </Dropdown.Menu>
        </Dropdown>{' '}
      </Form>{' '}
      {selectedResult && !embed && (
        <ButtonGroup>
          <Button
            title={t('search.routeFrom')}
            onClick={() => onRoutePlannerWithStartInit(selectedResult)}
          >
            <Glyphicon glyph="triangle-right" style={{ color: '#32CD32' }} />
          </Button>
          <Button
            title={t('search.routeTo')}
            onClick={() => onRoutePlannerWithFinishInit(selectedResult)}
          >
            <Glyphicon glyph="record" style={{ color: '#FF6347' }} />
          </Button>
        </ButtonGroup>
      )}
    </span>
  );
};

const mapStateToProps = (state: RootState) => ({
  results: state.search.results,
  selectedResult: state.search.selectedResult,
  // inProgress: state.search.inProgress,
  searchSeq: state.search.searchSeq,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onDoSearch(query: string) {
    dispatch(searchSetQuery({ query }));
  },
  onResultSelect(result: SearchResult | null) {
    dispatch(searchSelectResult(result));
  },
  onRoutePlannerWithStartInit(result: SearchResult) {
    const start = { lat: result.lat, lon: result.lon };
    dispatch(selectFeature({ type: 'route-planner' }));
    dispatch(routePlannerSetStart({ start }));
  },
  onRoutePlannerWithFinishInit(result: SearchResult) {
    const finish = { lat: result.lat, lon: result.lon };
    dispatch(selectFeature({ type: 'route-planner' }));
    dispatch(routePlannerSetFinish({ finish }));
  },
  onModify() {
    dispatch(searchSetResults([]));
  },
});

export const SearchMenu = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(SearchMenuInt));
