import React, { useCallback, useState } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import {
  searchSetQuery,
  searchHighlightResult,
  searchSelectResult,
  SearchResult,
} from 'fm3/actions/searchActions';
import { setTool } from 'fm3/actions/mainActions';
import {
  routePlannerSetStart,
  routePlannerSetFinish,
} from 'fm3/actions/routePlannerActions';
import { withTranslator, Translator } from 'fm3/l10nInjector';

import 'fm3/styles/search.scss';
import 'react-bootstrap-typeahead/css/Typeahead.css';
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
  onResultHiglight,
  onRoutePlannerWithStartInit,
  onRoutePlannerWithFinishInit,
  selectedResult,
  onDoSearch,
  results,
  inProgress,
  t,
}) => {
  const embed = window.self !== window.top;

  const [value, setValue] = useState('');

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
    },
    [setValue],
  );

  const FormGroup2 = FormGroup as any; // hacked missing attribute "bsRole" in type

  const handleSelect = useCallback(
    eventKey => {
      const found = results.find(item => item.id === eventKey);
      if (found) {
        onResultHiglight(found);
        // onResultSelect(found);
      }
    },
    [results, onResultSelect],
  );

  return (
    <>
      <Form inline onSubmit={handleSearch}>
        <Dropdown
          // className="dropdown-long"
          id="objectsMenuDropdown"
          // onToggle={handleToggle}
          open={results.length > 0}
        >
          <FormGroup2 bsRole="toggle">
            <FormControl onChange={handleChange} value={value} />
          </FormGroup2>
          <Dropdown.Menu>
            {results.map(result => (
              <MenuItem
                key={result.id}
                eventKey={result.id}
                onSelect={handleSelect}
              >
                {result.label}
                <br />
                <small>
                  {result.class}={result.type}
                </small>
              </MenuItem>
            ))}
          </Dropdown.Menu>
        </Dropdown>
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
  onResultHiglight(result: SearchResult | null) {
    dispatch(searchHighlightResult(result));
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
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(SearchMenu));
