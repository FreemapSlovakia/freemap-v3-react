import React from 'react';
import PropTypes from 'prop-types';

import 'fm3/styles/progressIndicator.scss';

export default function ProgressIndicator({ active }) {
  return <div className={`progress-indicator progress-indicator${active ? '-active' : '-inactive'}`} />;
}

ProgressIndicator.propTypes = {
  active: PropTypes.bool,
};
