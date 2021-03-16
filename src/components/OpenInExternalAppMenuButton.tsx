import { useMessages } from 'fm3/l10nInjector';
import { LatLon } from 'fm3/types/common';
import { ReactElement, useCallback, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Overlay, { Placement } from 'react-bootstrap/esm/Overlay';
import Popover from 'react-bootstrap/Popover';
import { OpenInExternalAppDropdownItems } from './OpenInExternalAppMenuItems';

interface Props extends LatLon {
  lat: number;
  lon: number;
  zoom: number;
  mapType: string;
  placement?: Placement;
  includePoint?: boolean;
  pointTitle?: string;
  pointDescription?: string;
  url?: string;
  children: JSX.Element | JSX.Element[];
}

export function OpenInExternalAppMenuButton({
  lat,
  lon,
  zoom,
  mapType,
  placement,
  includePoint,
  pointTitle,
  pointDescription,
  url,
  children,
}: Props): ReactElement {
  const m = useMessages();

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [show, setShow] = useState(false);

  const handleDropdownItemClick = useCallback(() => {
    setShow(false);
  }, [setShow]);

  const handleButtonClick = useCallback(() => {
    setShow(true);
  }, [setShow]);

  const handleHide = useCallback(() => {
    setShow(false);
  }, [setShow]);

  const getTarget = useCallback(() => buttonRef.current, [buttonRef]);

  return (
    <>
      <Button
        variant="secondary"
        ref={buttonRef}
        onClick={handleButtonClick}
        title={m?.external.openInExternal}
      >
        {children}
      </Button>
      <Overlay
        rootClose
        placement={placement ?? 'bottom'}
        // trigger="focus"
        show={show}
        onHide={handleHide}
        target={getTarget}
      >
        <Popover id="popover-trigger-click-root-close" className="fm-menu">
          <Popover.Content>
            <OpenInExternalAppDropdownItems
              lat={lat}
              lon={lon}
              zoom={zoom}
              mapType={mapType}
              includePoint={includePoint}
              pointTitle={pointTitle}
              pointDescription={pointDescription}
              url={url}
              onSelect={handleDropdownItemClick}
            />
          </Popover.Content>
        </Popover>
      </Overlay>
    </>
  );
}
