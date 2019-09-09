import React, { useCallback, useState, useEffect } from 'react';
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
import { setTool } from 'fm3/actions/mainActions';
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
} from 'react-bootstrap';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const SearchMenu: React.FC<Props> = ({
  onResultSelect,
  onRoutePlannerWithStartInit,
  onRoutePlannerWithFinishInit,
  selectedResult,
  onDoSearch,
  results,
  onModify,
  // inProgress,
  t,
}) => {
  const embed = window.self !== window.top;

  const [value, setValue] = useState('');

  const [open, setOpen] = useState(false);

  const [searchState, setSearchState] = useState(0);

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
    eventKey => {
      const found = results.find(item => item.id === eventKey);
      if (found) {
        onResultSelect(found);
      }
      if (selectedResult && selectedResult.id === eventKey) {
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

  useEffect(() => {
    if (results.length) {
      setOpen(true);
      setSearchState(searchState + 1);
    } else {
      setOpen(false);
      // setValue(''); TODO
    }
  }, [results, setOpen, setSearchState]);

  return (
    <>
      <Form inline onSubmit={handleSearch}>
        <Dropdown
          // className="dropdown-long"
          id="objectsMenuDropdown"
          open={open}
          onToggle={handleToggle as any}
          key={searchState}
        >
          <FormGroup2 bsRole="toggle">
            <FormControl
              onChange={handleChange}
              value={value}
              placeholder="Brusno"
            />
          </FormGroup2>
          <Dropdown.Menu className="fm-search-dropdown">
            {results.map(result => (
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
        <Button
          type="submit"
          title="Search"
          /* TODO translate */ disabled={!value}
        >
          <Glyphicon glyph="search" />
        </Button>
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
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  tool: state.main.tool,
  results: state.search.results,
  selectedResult: state.search.selectedResult,
  inProgress: state.search.inProgress,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onDoSearch(query: string) {
    dispatch(searchSetQuery(query));
  },
  onResultSelect(result: SearchResult) {
    dispatch(searchSelectResult(result));
  },
  onRoutePlannerWithStartInit(result: SearchResult) {
    const start = { lat: result.lat, lon: result.lon };
    dispatch(setTool('route-planner'));
    dispatch(routePlannerSetStart({ start }));
  },
  onRoutePlannerWithFinishInit(result: SearchResult) {
    const finish = { lat: result.lat, lon: result.lon };
    dispatch(setTool('route-planner'));
    dispatch(routePlannerSetFinish({ finish }));
  },
  onModify() {
    dispatch(searchSetResults([]));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(SearchMenu));
