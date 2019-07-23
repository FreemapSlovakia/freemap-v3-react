import React from 'react';
import { connect } from 'react-redux';
import { compose, Dispatch } from 'redux';
import { AsyncTypeahead, TypeaheadResult } from 'react-bootstrap-typeahead';
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
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { withTranslator, Translator } from 'fm3/l10nInjector';

import 'fm3/styles/search.scss';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';
import { geoJSON } from 'leaflet';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

class SearchMenu extends React.Component<Props> {
  onSuggestionHighlightChange(result: TypeaheadResult<SearchResult> | null) {
    // TODO to logic
    const le = getMapLeafletElement();
    if (le && result) {
      const { geojson } = result;
      const geojsonBounds = geoJSON(geojson).getBounds();
      le.fitBounds(
        geojsonBounds,
        geojson.type === 'Point' ? { maxZoom: 14 } : {},
      );
    }

    this.props.onResultHiglight(result);
  }

  handleSelectionChange = (resultsSelectedByUser: SearchResult[]) => {
    this.props.onResultSelect(resultsSelectedByUser[0]);
  };

  render() {
    const {
      onRoutePlannerWithStartInit,
      onRoutePlannerWithFinishInit,
      selectedResult,
      onDoSearch,
      results,
      inProgress,
      t,
    } = this.props;

    const embed = window.self !== window.top;

    return (
      <>
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
          onChange={this.handleSelectionChange}
          emptyLabel={t('search.noResults')}
          promptText={t('search.prompt')}
          renderMenuItemChildren={result => (
            <div
              key={result.label + result.id}
              onMouseEnter={() => this.onSuggestionHighlightChange(result)}
              onMouseLeave={() => this.onSuggestionHighlightChange(null)}
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
  }
}

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

export default compose(
  withTranslator,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(SearchMenu);
