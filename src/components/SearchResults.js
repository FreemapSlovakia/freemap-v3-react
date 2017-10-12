import React from 'react';
import { connect } from 'react-redux';
import Point from 'fm3/components/searchResults/Point';
import MultiPoint from 'fm3/components/searchResults/MultiPoint';
import Polyline from 'fm3/components/searchResults/Polyline';
import Polygon from 'fm3/components/searchResults/Polygon';
import MultiLineString from 'fm3/components/searchResults/MultiLineString';
import MultiPolygon from 'fm3/components/searchResults/MultiPolygon';
import * as FmPropTypes from 'fm3/propTypes';

function SearchResults({ highlightedResult, selectedResult }) {
  const elems = [];

  if (displayAsPoint(highlightedResult)) {
    elems.push(<Point key="xNJtDkdaWp" searchResult={highlightedResult} />);
  }
  if (displayAsMultiPoint(highlightedResult)) {
    elems.push(<MultiPoint key="57mLU1tOpb" searchResult={highlightedResult} />);
  }
  if (displayAsPolyline(highlightedResult)) {
    elems.push(<Polyline key="ZPTRG8wcbM" searchResult={highlightedResult} />);
  }
  if (displayAsMultiLineString(highlightedResult)) {
    elems.push(<MultiLineString key="MCN4K3cBKZ" searchResult={highlightedResult} />);
  }
  if (displayAsPolygon(highlightedResult)) {
    elems.push(<Polygon key="s0Q2ayZAPC" searchResult={highlightedResult} />);
  }
  if (displayAsMultiPolygon(highlightedResult)) {
    elems.push(<MultiPolygon key="ooTQAEhWlE" searchResult={highlightedResult} />);
  }
  if (displayAsPoint(selectedResult)) {
    elems.push(<Point key="ytw1EK0JKa" searchResult={selectedResult} />);
  }
  if (displayAsMultiPoint(selectedResult)) {
    elems.push(<MultiPoint key="5ZD877zq3D" searchResult={selectedResult} />);
  }
  if (displayAsPolyline(selectedResult)) {
    elems.push(<Polyline key="Gwl4IIRNIk" searchResult={selectedResult} />);
  }
  if (displayAsMultiLineString(selectedResult)) {
    elems.push(<MultiLineString key="mrfuSaPDr1" searchResult={selectedResult} />);
  }
  if (displayAsPolygon(selectedResult)) {
    elems.push(<Polygon key="5FaEitXbBU" searchResult={selectedResult} />);
  }
  if (displayAsMultiPolygon(selectedResult)) {
    elems.push(<MultiPolygon key="CFpwLWFFuN" searchResult={selectedResult} />);
  }

  return elems;
}

SearchResults.propTypes = {
  highlightedResult: FmPropTypes.searchResult,
  selectedResult: FmPropTypes.searchResult,
};

function displayAsPoint(result) {
  return result && result.geojson.type === 'Point';
}

function displayAsMultiPoint(result) {
  return result && result.geojson.type === 'MultiPoint';
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

export default connect(state => ({
  highlightedResult: state.search.highlightedResult,
  selectedResult: state.search.selectedResult,
}))(SearchResults);
