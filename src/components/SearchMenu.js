import React from 'react';
import PropTypes from 'prop-types';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import Panel from 'react-bootstrap/lib/Panel';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import { connect } from 'react-redux';
import { searchSetQuery, searchHighlightResult, searchSelectResult } from 'fm3/actions/searchActions';
import { setTool } from 'fm3/actions/mainActions';
import { routePlannerSetStart, routePlannerSetFinish } from 'fm3/actions/routePlannerActions';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import * as FmPropTypes from 'fm3/propTypes';

import 'fm3/styles/search.scss';

class SearchMenu extends React.Component {
  onSelectionChange = (resultsSelectedByUser) => {
    this.props.onResultSelect(resultsSelectedByUser[0], this.props.tool);
  }

  onSuggestionHighlightChange(result) {
    if (result) {
      const geojson = result.geojson;
      const options = {};
      if (geojson.type === 'Point') {
        options.maxZoom = 14;
      }
      const geojsonBounds = L.geoJson(geojson).getBounds();
      getMapLeafletElement().fitBounds(geojsonBounds, options);
    }
    this.props.onResultHiglight(result);
  }

  render() {
    const { onRoutePlannerWithStartInit, onRoutePlannerWithFinishInit, selectedResult, onDoSearch, results } = this.props;

    return (
      <Panel className="fm-toolbar">
        <AsyncTypeahead
          labelKey="label"
          useCache={false}
          minLength={3}
          delay={500}
          ignoreDiacritics
          onSearch={onDoSearch}
          options={results}
          searchText="Hľadám…"
          placeholder="Brusno"
          clearButton
          onChange={this.onSelectionChange}
          emptyLabel="Nenašli sa žiadne výsledky"
          promptText="Zadajte lokalitu"
          renderMenuItemChildren={result => (
            <div
              key={result.label + result.id}
              onMouseEnter={() => this.onSuggestionHighlightChange(result)}
              onMouseLeave={() => this.onSuggestionHighlightChange(null)}
            >
              <span>{result.tags.name} </span><br />
              <span>({result.geojson.type})</span>
            </div>
          )}
        />
        {' '}
        <ButtonGroup>
          <Button onClick={() => onRoutePlannerWithStartInit(selectedResult)} disabled={!selectedResult}>
            <Glyphicon glyph="triangle-right" style={{ color: '#32CD32' }} />
            <span className="hidden-xs"> Navigovať odtiaľto</span>
          </Button>
          <Button onClick={() => onRoutePlannerWithFinishInit(selectedResult)} disabled={!selectedResult}>
            <Glyphicon glyph="record" style={{ color: '#FF6347' }} />
            <span className="hidden-xs"> Navigovať sem</span>
          </Button>
        </ButtonGroup>
      </Panel>
    );
  }
}

SearchMenu.propTypes = {
  tool: FmPropTypes.tool,
  selectedResult: FmPropTypes.searchResult,
  results: PropTypes.arrayOf(FmPropTypes.searchResult).isRequired,
  onDoSearch: PropTypes.func.isRequired,
  onResultHiglight: PropTypes.func.isRequired,
  onResultSelect: PropTypes.func.isRequired,
  onRoutePlannerWithStartInit: PropTypes.func.isRequired,
  onRoutePlannerWithFinishInit: PropTypes.func.isRequired,
};


export default connect(
  state => ({
    tool: state.main.tool,
    results: state.search.results,
    selectedResult: state.search.selectedResult,
  }),
  dispatch => ({
    onDoSearch(query) {
      dispatch(searchSetQuery(query));
    },
    onResultHiglight(result) {
      dispatch(searchHighlightResult(result));
    },
    onResultSelect(result) {
      dispatch(setTool(result ? 'search' : null));
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
)(SearchMenu);
