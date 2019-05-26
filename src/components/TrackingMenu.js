import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import Button from 'react-bootstrap/lib/Button';

import { infoPointAdd, infoPointDelete } from 'fm3/actions/infoPointActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';
import injectL10n from 'fm3/l10nInjector';

class TrackingMenu extends React.Component {
  static propTypes = {
    onLabelModify: PropTypes.func.isRequired,
    onInfoPointAdd: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    isActive: PropTypes.bool,
    t: PropTypes.func.isRequired,
  };

  componentDidMount() {
    mapEventEmitter.on('mapClick', this.handleInfoPointAdd);
  }

  componentWillUnmount() {
    mapEventEmitter.removeListener('mapClick', this.handleInfoPointAdd);
  }

  handleInfoPointAdd = (lat, lon) => {
    this.props.onInfoPointAdd(lat, lon);
  }

  render() {
    const { onLabelModify, isActive, onDelete, t } = this.props;
    return (
      <>
        <span className="fm-label">
          <FontAwesomeIcon icon="thumb-tack" />
          <span className="hidden-xs"> {t('tools.infoPoint')}</span>
        </span>
        {' '}
        <Button onClick={onLabelModify} disabled={!isActive}>
          <FontAwesomeIcon icon="tag" />
          <span className="hidden-xs"> {t('infoPoint.modify')}</span>
        </Button>
        {' '}
        <Button onClick={onDelete} disabled={!isActive}>
          <FontAwesomeIcon icon="trash-o" />
          <span className="hidden-xs"> {t('general.delete')}</span>
        </Button>
      </>
    );
  }
}

export default compose(
  injectL10n(),
  connect(
    state => ({
      activeModal: state.main.activeModal,
      label: state.infoPoint.label,
      isActive: state.infoPoint.activeIndex !== null,
    }),
    dispatch => ({
      onInfoPointAdd(lat, lon) {
        dispatch(infoPointAdd(lat, lon, ''));
      },
      onLabelModify() {
        dispatch(setActiveModal('info-point-change-label'));
      },
      onDelete() {
        dispatch(infoPointDelete());
      },
    }),
  ),
)(TrackingMenu);
