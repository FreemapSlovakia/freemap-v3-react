import React from 'react';
import { connect } from 'react-redux';
import Point from 'fm3/components/SearchResults/Point';
import Polyline from 'fm3/components/SearchResults/Polyline';
import Polygon from 'fm3/components/SearchResults/Polygon';

class SearchResults extends React.Component {

  displayAsPoint(result) {
    return result && (result.geojson.type === 'Point' || result.geojson.type === 'MultiPolygon');
  }

  displayAsPolyline(result) {
    return result && (result.geojson.type === 'LineString');
  }

  displayAsPolygon(result) {
    return result && (result.geojson.type === 'Polygon');
  }

  render() {
    const { highlightedResult, selectedResult } = this.props;

    return (
      <div>
        {this.displayAsPoint(highlightedResult) &&
          <Point searchResult={highlightedResult} theme="highlighted" />
        }
        {this.displayAsPolyline(highlightedResult) &&
          <Polyline searchResult={highlightedResult} theme="highlighted" />
        }
        {this.displayAsPolygon(highlightedResult) &&
          <Polygon searchResult={highlightedResult} theme="highlighted" />
        }
        {this.displayAsPoint(selectedResult) &&
          <Point searchResult={selectedResult} theme="selected" />
        }
        {this.displayAsPolyline(selectedResult) &&
          <Polyline searchResult={selectedResult} theme="selected" />
        }
        {this.displayAsPolygon(selectedResult) &&
          <Polygon searchResult={selectedResult} theme="selected" />
        }
      </div>
  );
  }
}

SearchResults.propTypes = {
  highlightedResult: React.PropTypes.any,
  selectedResult: React.PropTypes.any
};

export default connect(
  function (state) {
    return {
      highlightedResult: state.search.highlightedResult,
      selectedResult: state.search.selectedResult,
    };
  },
  function () {
    return {
    };
  }
)(SearchResults);