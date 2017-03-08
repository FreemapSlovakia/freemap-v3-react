import React from 'react';
import { connect } from 'react-redux';
import Point from 'fm3/components/searchResults/Point';
import Polyline from 'fm3/components/searchResults/Polyline';
import Polygon from 'fm3/components/searchResults/Polygon';
import MultiPolygon from 'fm3/components/searchResults/MultiPolygon';

class SearchResults extends React.Component {

  render() {
    const { highlightedResult, selectedResult } = this.props;

    return (
      <div>
        {displayAsPoint(highlightedResult) &&
          <Point searchResult={highlightedResult} theme="highlighted" />
        }
        {displayAsPolyline(highlightedResult) &&
          <Polyline searchResult={highlightedResult} theme="highlighted" />
        }
        {displayAsPolygon(highlightedResult) &&
          <Polygon searchResult={highlightedResult} theme="highlighted" />
        }
        {displayAsMultiPolygon(highlightedResult) &&
          <MultiPolygon searchResult={highlightedResult} theme="highlighted" />
        }
        {displayAsPoint(selectedResult) &&
          <Point searchResult={selectedResult} theme="selected" />
        }
        {displayAsPolyline(selectedResult) &&
          <Polyline searchResult={selectedResult} theme="selected" />
        }
        {displayAsPolygon(selectedResult) &&
          <Polygon searchResult={selectedResult} theme="selected" />
        }
        {displayAsMultiPolygon(selectedResult) &&
          <MultiPolygon searchResult={selectedResult} theme="selected" />
        }
      </div>
    );
  }
}

SearchResults.propTypes = {
  highlightedResult: React.PropTypes.any,
  selectedResult: React.PropTypes.any
};

function displayAsPoint(result) {
  return result && result.geojson.type === 'Point';
}

function displayAsPolyline(result) {
  return result && (result.geojson.type === 'LineString');
}

function displayAsPolygon(result) {
  return result && (result.geojson.type === 'Polygon');
}

function displayAsMultiPolygon(result) {
  return result && (result.geojson.type === 'MultiPolygon');
}

export default connect(
  function (state) {
    return {
      highlightedResult: state.search.highlightedResult,
      selectedResult: state.search.selectedResult
    };
  }
)(SearchResults);
