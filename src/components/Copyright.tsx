import { setActiveModal } from 'fm3/actions/mainActions';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { useDispatch, useSelector } from 'react-redux';
import { Attribution } from './Attribution';
import { FontAwesomeIcon } from './FontAwesomeIcon';

export function Copyright(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const mapType = useSelector((state: RootState) => state.map.mapType);

  const overlays = useSelector((state: RootState) => state.map.overlays);

  // const imhd = useSelector(
  //   (state: RootState) => state.routePlanner.transportType === 'imhd',
  // );

  const showLegendButton = useSelector((state: RootState) =>
    (['sk', 'cs'].includes(state.l10n.language)
      ? ['A', 'K', 'T', 'C', 'X', 'O']
      : ['X', 'O']
    ).includes(state.map.mapType),
  );

  return (
    <Card
      className="fm-toolbar"
      style={{ float: 'right', marginRight: '10px' }}
    >
      {showLegendButton && (
        <Button
          variant="secondary"
          title={m?.more.mapLegend}
          onClick={() => dispatch(setActiveModal('legend'))}
        >
          <FontAwesomeIcon icon="question" />
        </Button>
      )}
      <OverlayTrigger
        trigger="click"
        rootClose
        rootCloseEvent="mousedown"
        placement="top"
        overlay={
          <Popover id="popover-positioned-right" className="fm-attr-popover">
            <Attribution
              m={m}
              mapType={mapType}
              overlays={overlays}
              // imhd={imhd}
            />
          </Popover>
        }
      >
        <Button className="ml-1" variant="secondary" title={m?.main.copyright}>
          <FontAwesomeIcon icon="copyright" />
        </Button>
      </OverlayTrigger>
    </Card>
  );
}
