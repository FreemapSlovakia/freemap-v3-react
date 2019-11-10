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

type Props = ReturnType<typeof mapStateToProps> & {
  t: Translator;
};

const CopyrightInt: React.FC<Props> = ({ mapType, overlays, imhd, t }) => (
  <Panel className="fm-toolbar" style={{ float: 'right', marginRight: '10px' }}>
    <ButtonToolbar>
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
});

export const Copyright = connect(mapStateToProps)(withTranslator(CopyrightInt));
