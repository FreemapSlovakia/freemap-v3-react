import Toposcope from './toposcope.jsx';
import React from 'react';
import ReactDOM from 'react-dom';

export function render(element, props) {
  ReactDOM.render(<Toposcope {...props}/>, element);
}
