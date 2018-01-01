import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import Button from 'react-bootstrap/lib/Button';

import { mapDetailsSetSubtool, mapDetailsSetUserSelectedPosition } from 'fm3/actions/mapDetailsActions';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

import injectL10n from 'fm3/l10nInjector';

class MapDetailsMenu extends React.Component {
  static propTypes = {
    subtool: PropTypes.oneOf(['track-info']),
    onSubtoolChange: PropTypes.func.isRequired,
    onSetUserSelectedPosition: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  };

  componentWillMount() {
    mapEventEmitter.on('mapClick', this.setUserSelectedPosition);
  }

  componentWillUnmount() {
    mapEventEmitter.removeListener('mapClick', this.setUserSelectedPosition);
  }

  setUserSelectedPosition = (lat, lon) => {
    if (this.props.subtool !== null) {
      this.props.onSetUserSelectedPosition(lat, lon);
    }
  }

  render() {
    const { subtool, onSubtoolChange, t } = this.props;
    return (
      <React.Fragment>
        <span className="fm-label">
          <FontAwesomeIcon icon="info" />
          <span className="hidden-xs"> {t('tools.mapDetails')}</span>
        </span>
        {' '}
        <Button
          onClick={() => onSubtoolChange('track-info')}
          active={subtool === 'track-info'}
          title={t('mapDetails.road')}
        >
          <FontAwesomeIcon icon="road" />
          <span className="hidden-xs"> {t('mapDetails.road')}</span>
        </Button>
      </React.Fragment>
    );
  }
}

export default compose(
  injectL10n(),
  connect(
    state => ({
      subtool: state.mapDetails.subtool,
    }),
    dispatch => ({
      onSubtoolChange(subtool) {
        dispatch(mapDetailsSetSubtool(subtool));
      },
      onSetUserSelectedPosition(lat, lon) {
        dispatch(mapDetailsSetUserSelectedPosition(lat, lon));
      },
    }),
  ),
)(MapDetailsMenu);
