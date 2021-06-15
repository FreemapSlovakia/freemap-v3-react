import { useMessages } from 'fm3/l10nInjector';
import { LatLon } from 'fm3/types/common';
import { ReactElement, useCallback, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Overlay, { Placement } from 'react-bootstrap/esm/Overlay';
import Popover from 'react-bootstrap/Popover';
import { useSelector } from 'react-redux';
import { OpenInExternalAppDropdownItems } from './OpenInExternalAppMenuItems';

interface Props extends LatLon {
  lat: number;
  lon: number;
  placement?: Placement;
  includePoint?: boolean;
  pointTitle?: string;
  pointDescription?: string;
  url?: string;
  className?: string;
  children: JSX.Element | JSX.Element[];
}

export function OpenInExternalAppMenuButton({
  lat,
  lon,
  placement,
  includePoint,
  pointTitle,
  pointDescription,
  url,
  children,
  className,
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

  const mapType = useSelector((state) => state.map.mapType);

  const zoom = useSelector((state) => state.map.zoom);

  return (
    <>
      <Button
        variant="secondary"
        ref={buttonRef}
        onClick={handleButtonClick}
        title={m?.external.openInExternal}
        className={className}
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
        <Popover id="popover-open-ext" className="fm-menu">
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
