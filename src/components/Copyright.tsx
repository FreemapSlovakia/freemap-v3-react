import React, { ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { useTranslator } from 'fm3/l10nInjector';
import { setActiveModal } from 'fm3/actions/mainActions';

export function Copyright(): ReactElement {
  const t = useTranslator();

  const dispatch = useDispatch();

  const mapType = useSelector((state: RootState) => state.map.mapType);

  const overlays = useSelector((state: RootState) => state.map.overlays);

  const imhd = useSelector(
    (state: RootState) => state.routePlanner.transportType === 'imhd',
  );

  const showLegendButton = useSelector((state: RootState) =>
    (['sk', 'cs'].includes(state.l10n.language)
      ? ['A', 'K', 'T', 'C', 'X', 'O']
      : ['X', 'O']
    ).includes(state.map.mapType),
  );

  return (
    <Panel
      className="fm-toolbar"
      style={{ float: 'right', marginRight: '10px' }}
    >
      <ButtonToolbar>
        {showLegendButton && (
          <Button
            title={t('more.mapLegend')}
            onClick={() => dispatch(setActiveModal('legend'))}
          >
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
}
