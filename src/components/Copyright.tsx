import { setActiveModal } from 'fm3/actions/mainActions';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { FaQuestion, FaRegCopyright } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Attribution } from './Attribution';

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
    <Card className="fm-toolbar mr-2 mb-2">
      {showLegendButton && (
        <Button
          className="mr-1"
          variant="secondary"
          title={m?.more.mapLegend}
          onClick={() => dispatch(setActiveModal('legend'))}
        >
          <FaQuestion />
        </Button>
      )}
      <OverlayTrigger
        trigger="click"
        rootClose
        placement="top"
        overlay={
          <Popover
            id="popover-positioned-right"
            className="fm-attr-popover pl-2 pr-3"
          >
            <Attribution
              m={m}
              mapType={mapType}
              overlays={overlays}
              // imhd={imhd}
            />
          </Popover>
        }
      >
        <Button variant="secondary" title={m?.main.copyright}>
          <FaRegCopyright />
        </Button>
      </OverlayTrigger>
    </Card>
  );
}
