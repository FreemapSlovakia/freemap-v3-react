import React, { ReactElement, useCallback, useRef, useState } from 'react';
import Button from 'react-bootstrap/lib/Button';
import Popover from 'react-bootstrap/lib/Popover';
import { useMessages } from 'fm3/l10nInjector';
import { Overlay } from 'react-bootstrap';
import { LatLon } from 'fm3/types/common';
import { OpenInExternalAppMenuItems } from './OpenInExternalAppMenuItems';

interface Props extends LatLon {
  lat: number;
  lon: number;
  zoom: number;
  mapType: string;
  expertMode: boolean;
  placement?: string;
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

  const buttonRef = useRef<Button>();

  const [show, setShow] = useState(false);

  const handleMenuItemClick = useCallback(() => {
    setShow(false);
  }, [setShow]);

  const handleButtonClick = useCallback(() => {
    setShow(true);
  }, [setShow]);

  const handleHide = useCallback(() => {
    setShow(false);
  }, [setShow]);

  const getTarget = useCallback(() => buttonRef.current, [buttonRef]);

  const Ovl = Overlay as any; // because trigger is missing

  return (
    <>
      <Button
        ref={buttonRef as React.MutableRefObject<Button>}
        onClick={handleButtonClick}
        title={m?.external.openInExternal}
      >
        {children}
      </Button>
      <Ovl
        rootClose
        placement={placement || 'bottom'}
        trigger="focus"
        show={show}
        onHide={handleHide}
        target={getTarget}
      >
        <Popover id="popover-trigger-click-root-close" className="fm-menu">
          <ul>
            <OpenInExternalAppMenuItems
              lat={lat}
              lon={lon}
              zoom={zoom}
              mapType={mapType}
              expertMode={expertMode}
              includePoint={includePoint}
              pointTitle={pointTitle}
              pointDescription={pointDescription}
              url={url}
              onSelect={handleMenuItemClick}
            />
          </ul>
        </Popover>
      </Ovl>
    </>
  );
}
