import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import { searchSetQuery, searchHighlightResult, searchSelectResult } from 'fm3/actions/searchActions';
import { setTool } from 'fm3/actions/mainActions';
import { routePlannerSetStart, routePlannerSetFinish } from 'fm3/actions/routePlannerActions';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import * as FmPropTypes from 'fm3/propTypes';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import injectL10n from 'fm3/l10nInjector';

import 'fm3/styles/search.scss';
import 'react-bootstrap-typeahead/css/Typeahead.css';

class SearchMenu extends React.Component {
  static propTypes = {
    tool: FmPropTypes.tool,
    selectedResult: FmPropTypes.searchResult,
    results: PropTypes.arrayOf(FmPropTypes.searchResult).isRequired,
    onDoSearch: PropTypes.func.isRequired,
    onResultHiglight: PropTypes.func.isRequired,
    onResultSelect: PropTypes.func.isRequired,
    onRoutePlannerWithStartInit: PropTypes.func.isRequired,
    onRoutePlannerWithFinishInit: PropTypes.func.isRequired,
    inProgress: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
  }

  onSuggestionHighlightChange(result) {
    // TODO to logic
    if (result) {
      const { geojson } = result;
      const options = {};
      if (geojson.type === 'Point') {
        options.maxZoom = 14;
      }
      const geojsonBounds = L.geoJson(geojson).getBounds();
      getMapLeafletElement().fitBounds(geojsonBounds, options);
    }

    this.props.onResultHiglight(result);
  }

  handleSelectionChange = (resultsSelectedByUser) => {
    this.props.onResultSelect(resultsSelectedByUser[0], this.props.tool);
  }

  render() {
    const { onRoutePlannerWithStartInit, onRoutePlannerWithFinishInit, selectedResult,
      onDoSearch, results, inProgress, t } = this.props;

    const embed = window.self !== window.top;

    return (
      <>
        <span className="fm-label">
          <FontAwesomeIcon icon="search" />
        </span>
        {' '}
        <AsyncTypeahead
          isLoading={inProgress}
          labelKey="label"
          useCache={false}
          minLength={3}
          delay={500}
          ignoreDiacritics
          onSearch={onDoSearch}
          options={results}
          searchText={t('search.inProgress')}
          placeholder="Brusno"
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
              {result.tags.name} <br />
              ({result.geojson.type})
            </div>
          )}
        />
        {' '}
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

export default compose(
  injectL10n(),
  connect(
    state => ({
      tool: state.main.tool,
      results: state.search.results,
      selectedResult: state.search.selectedResult,
      inProgress: state.search.inProgress,
    }),
    dispatch => ({
      onDoSearch(query) {
        dispatch(searchSetQuery(query));
      },
      onResultHiglight(result) {
        dispatch(searchHighlightResult(result));
      },
      onResultSelect(result) {
        dispatch(searchSelectResult(result));
      },
      onRoutePlannerWithStartInit(result) {
        const start = { lat: result.lat, lon: result.lon };
        dispatch(setTool('route-planner'));
        dispatch(routePlannerSetStart(start));
      },
      onRoutePlannerWithFinishInit(result) {
        const finish = { lat: result.lat, lon: result.lon };
        dispatch(setTool('route-planner'));
        dispatch(routePlannerSetFinish(finish));
      },
    }),
  ),
)(SearchMenu);
