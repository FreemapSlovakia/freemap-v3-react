import React from 'react';
import { connect } from 'react-redux';
import { compose, Dispatch } from 'redux';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import Button from 'react-bootstrap/lib/Button';

import {
  mapDetailsSetSubtool,
  mapDetailsSetUserSelectedPosition,
} from 'fm3/actions/mapDetailsActions';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

import injectL10n, { Translator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

class MapDetailsMenu extends React.Component<Props> {
  componentDidMount() {
    mapEventEmitter.on('mapClick', this.setUserSelectedPosition);
  }

  componentWillUnmount() {
    mapEventEmitter.removeListener('mapClick', this.setUserSelectedPosition);
  }

  setUserSelectedPosition = (lat: number, lon: number) => {
    if (this.props.subtool !== null) {
      this.props.onSetUserSelectedPosition(lat, lon);
    }
  };

  render() {
    const { subtool, onSubtoolChange, t } = this.props;
    return (
      <>
        <span className="fm-label">
          <FontAwesomeIcon icon="info" />
          <span className="hidden-xs"> {t('tools.mapDetails')}</span>
        </span>{' '}
        <Button
          onClick={() => onSubtoolChange('track-info')}
          active={subtool === 'track-info'}
          title={t('mapDetails.road')}
        >
          <FontAwesomeIcon icon="road" />
          <span className="hidden-xs"> {t('mapDetails.road')}</span>
        </Button>
      </>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  subtool: state.mapDetails.subtool,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onSubtoolChange(subtool: string) {
    dispatch(mapDetailsSetSubtool(subtool));
  },
  onSetUserSelectedPosition(lat: number, lon: number) {
    dispatch(mapDetailsSetUserSelectedPosition({ lat, lon }));
  },
});

export default compose(
  injectL10n(),
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(MapDetailsMenu);
