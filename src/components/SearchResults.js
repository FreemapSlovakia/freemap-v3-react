import React from 'react';
import { connect } from 'react-redux';
import Point from 'fm3/components/searchResults/Point';
import Polyline from 'fm3/components/searchResults/Polyline';
import Polygon from 'fm3/components/searchResults/Polygon';
import MultiLineString from 'fm3/components/searchResults/MultiLineString';
import MultiPolygon from 'fm3/components/searchResults/MultiPolygon';

function SearchResults({ highlightedResult, selectedResult }) {

  return (
    <div>
      {displayAsPoint(highlightedResult) &&
        <Point searchResult={highlightedResult} theme="highlighted"/>
      }
      {displayAsPolyline(highlightedResult) &&
        <Polyline searchResult={highlightedResult} theme="highlighted"/>
      }
      {displayAsMultiLineString(highlightedResult) &&
        <MultiLineString searchResult={highlightedResult} theme="highlighted"/>
      }
      {displayAsPolygon(highlightedResult) &&
        <Polygon searchResult={highlightedResult} theme="highlighted"/>
      }
      {displayAsMultiPolygon(highlightedResult) &&
        <MultiPolygon searchResult={highlightedResult} theme="highlighted"/>
      }
      {displayAsPoint(selectedResult) &&
        <Point searchResult={selectedResult} theme="selected"/>
      }
      {displayAsPolyline(selectedResult) &&
        <Polyline searchResult={selectedResult} theme="selected"/>
      }
      {displayAsMultiLineString(selectedResult) &&
        <MultiLineString searchResult={selectedResult} theme="selected"/>
      }
      {displayAsPolygon(selectedResult) &&
        <Polygon searchResult={selectedResult} theme="selected"/>
      }
      {displayAsMultiPolygon(selectedResult) &&
        <MultiPolygon searchResult={selectedResult} theme="selected"/>
      }
    </div>
  );
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

function displayAsMultiLineString(result) {
  return result && (result.geojson.type === 'MultiLineString');
}

export default connect(
  function (state) {
    return {
      highlightedResult: state.search.highlightedResult,
      selectedResult: state.search.selectedResult
    };
  }
)(SearchResults);
