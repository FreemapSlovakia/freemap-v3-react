import { ReactElement, useCallback, useRef, useState } from 'react';
import { useMessages } from 'fm3/l10nInjector';
import { Button, Overlay, Popover } from 'react-bootstrap';
import { LatLon } from 'fm3/types/common';
import { OpenInExternalAppDropdownItems } from './OpenInExternalAppMenuItems';
import { Placement } from 'react-bootstrap/esm/Overlay';

interface Props extends LatLon {
  lat: number;
  lon: number;
  zoom: number;
  mapType: string;
  expertMode: boolean;
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
  expertMode,
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
              expertMode={expertMode}
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
