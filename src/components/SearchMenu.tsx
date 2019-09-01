import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
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
// import { FormControl, FormGroup, Form } from 'react-bootstrap';

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
  const handleSelectionChange = useCallback(
    (resultsSelectedByUser: SearchResult[]) => {
      onResultSelect(resultsSelectedByUser[0]);
    },
    [onResultSelect],
  );

  const embed = window.self !== window.top;

  return (
    <>
      {/* <Form inline onSubmit={this.handleSearch}>
        <FormGroup>
          <FormControl />
        </FormGroup>
      </Form> */}
      <AsyncTypeahead
        id="search"
        isLoading={inProgress}
        labelKey="label"
        useCache={false}
        minLength={3}
        delay={500}
        ignoreDiacritics
        onSearch={onDoSearch}
        options={results}
        searchText={t('search.inProgress')}
        placeholder="&#xF002; Brusno"
        clearButton
        onChange={handleSelectionChange}
        emptyLabel={t('search.noResults')}
        promptText={t('search.prompt')}
        renderMenuItemChildren={result => (
          <div
            key={result.label + result.id}
            onMouseEnter={() => onResultHiglight(result)}
            onMouseLeave={() => onResultHiglight(null)}
          >
            {result.tags.name} <br />({result.geojson.type})
          </div>
        )}
      />{' '}
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
