import React from 'react';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import Navbar from 'react-bootstrap/lib/Navbar';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import { connect } from 'react-redux';
import { doSearch, highlightResult, selectResult } from 'fm3/actions/searchActions';
import { setTool } from 'fm3/actions/mainActions';
import { setStart, setFinish } from 'fm3/actions/routePlannerActions';
import 'fm3/styles/search.scss';

class Search extends React.Component {
  onSelectionChange(resultsSelectedByUser) {
    this.props.onSelectResult(resultsSelectedByUser[0], this.props.tool);
  }

  onSuggestionHighlightChange(result) {
    this.props.onHiglightResult(result);
  }

  render() {
    const b = (fn, ...args) => fn.bind(this, ...args);
    const { onInitRoutePlannerWithStart, onInitRoutePlannerWithFinish, selectedResult } = this.props;

    // FIXME wrapper element can't be used
    return (
      <div>
        <Navbar.Form pullLeft>
          <AsyncTypeahead
            labelKey="label"
            useCache={false}
            minLength={3}
            delay={500}
            ignoreDiacritics
            onSearch={this.props.onDoSearch}
            options={this.props.results}
            searchText="Hľadám…"
            placeholder="Brusno"
            clearButton
            onChange={b(this.onSelectionChange)}
            emptyLabel={'Nenašli sa žiadne výsledky'}
            renderMenuItemChildren={(result) => (
              <div key={result.label + result.id}
                onMouseEnter={b(this.onSuggestionHighlightChange, result)}
                onMouseLeave={b(this.onSuggestionHighlightChange, null)}
              >
                <span>{result.tags.name} </span><br/>
                <span>({result.geojson.type}, {result.tags.type})</span>
              </div>
            )}
          />
        </Navbar.Form>
        {this.props.tool === 'search' &&
          <Navbar.Form pullLeft>
            <ButtonGroup>
              <Button onClick={b(onInitRoutePlannerWithStart, selectedResult)}>
                <Glyphicon glyph="triangle-right" style={{ color: '#32CD32' }}/> Navigovať odtiaľto
              </Button>
              <Button onClick={b(onInitRoutePlannerWithFinish, selectedResult)}>
                <Glyphicon glyph="record" style={{ color: '#FF6347' }}/> Navigovať sem
              </Button>
            </ButtonGroup>
          </Navbar.Form>
        }
      </div>
    );
  }
}

Search.propTypes = {
  tool: React.PropTypes.string,
  selectedResult: React.PropTypes.any,
  results: React.PropTypes.array.isRequired,
  onDoSearch: React.PropTypes.func.isRequired,
  onHiglightResult: React.PropTypes.func.isRequired,
  onSelectResult: React.PropTypes.func.isRequired,
  onInitRoutePlannerWithStart: React.PropTypes.func.isRequired,
  onInitRoutePlannerWithFinish: React.PropTypes.func.isRequired
};


export default connect(
  function (state) {
    return {
      tool: state.main.tool,
      results: state.search.results,
      selectedResult: state.search.selectedResult
    };
  },
  function (dispatch) {
    return {
      onDoSearch(query) {
        dispatch(doSearch(query));
      },
      onHiglightResult(result) {
        dispatch(highlightResult(result));
      },
      onSelectResult(result) {
        result ? dispatch(setTool('search')) : dispatch(setTool(null));
        dispatch(selectResult(result));
      },
      onInitRoutePlannerWithStart(result) {
        const start = { lat: result.lat, lon: result.lon };
        dispatch(setTool('route-planner'));
        dispatch(setStart(start));
      },
      onInitRoutePlannerWithFinish(result) {
        const finish = { lat: result.lat, lon: result.lon };
        dispatch(setTool('route-planner'));
        dispatch(setFinish(finish));
      }
    };
  }
)(Search);
