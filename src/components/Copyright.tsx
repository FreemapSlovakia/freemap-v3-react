import React from 'react';
import { connect } from 'react-redux';
import {
  Panel,
  ButtonToolbar,
  OverlayTrigger,
  Popover,
  Button,
} from 'react-bootstrap';
import { Attribution } from './Attribution';
import { FontAwesomeIcon } from './FontAwesomeIcon';
import { RootState } from 'fm3/storeCreator';
import { Translator, withTranslator } from 'fm3/l10nInjector';
import { Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';
import { setActiveModal } from 'fm3/actions/mainActions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const CopyrightInt: React.FC<Props> = ({
  mapType,
  overlays,
  imhd,
  t,
  onLegend,
  showLegendButton,
}) => (
  <Panel className="fm-toolbar" style={{ float: 'right', marginRight: '10px' }}>
    <ButtonToolbar>
      {showLegendButton && (
        <Button title={t('more.mapLegend')} onClick={onLegend}>
          <FontAwesomeIcon icon="question" />
        </Button>
      )}
      <OverlayTrigger
        trigger="click"
        rootClose
        placement="top"
        overlay={
          <Popover id="popover-positioned-right" className="fm-attr-popover">
            <Attribution
              t={t}
              mapType={mapType}
              overlays={overlays}
              imhd={imhd}
            />
          </Popover>
        }
      >
        <Button title={t('main.copyright')}>
          <FontAwesomeIcon icon="copyright" />
        </Button>
      </OverlayTrigger>
    </ButtonToolbar>
  </Panel>
);

const mapStateToProps = (state: RootState) => ({
  mapType: state.map.mapType,
  overlays: state.map.overlays,
  imhd: state.routePlanner.transportType === 'imhd',
  showLegendButton: (['sk', 'cs'].includes(state.l10n.language)
    ? ['A', 'K', 'T', 'C', 'X', 'O']
    : ['X', 'O']
  ).includes(state.map.mapType),
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onLegend() {
    dispatch(setActiveModal('legend'));
  },
});

export const Copyright = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(CopyrightInt));
