import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useMessages } from 'fm3/l10nInjector';
import { LatLon } from 'fm3/types/common';
import { ReactElement } from 'react';
import { OverlayProps } from 'react-bootstrap/esm/Overlay';
import { OpenInExternalAppDropdownItems } from './OpenInExternalAppMenuItems';
import { Dropdown } from 'react-bootstrap';
import { useMenuHandler } from 'fm3/hooks/useMenuHandler';

interface Props extends LatLon {
  lat: number;
  lon: number;
  placement?: OverlayProps['placement'];
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

  const { handleSelect, menuShown, handleMenuToggle } = useMenuHandler();

  const mapType = useAppSelector((state) => state.map.mapType);

  const zoom = useAppSelector((state) => state.map.zoom);

  return (
    <Dropdown
      placement={placement}
      className={className}
      onSelect={handleSelect}
      show={menuShown}
      onToggle={handleMenuToggle}
    >
      <Dropdown.Toggle variant="secondary" title={m?.external.openInExternal}>
        {children}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <OpenInExternalAppDropdownItems
          lat={lat}
          lon={lon}
          zoom={zoom}
          mapType={mapType}
          includePoint={includePoint}
          // pointTitle={pointTitle}
          // pointDescription={pointDescription}
          url={url}
          // onSelect={handleDropdownItemClick}
        />
      </Dropdown.Menu>
      {/* </Popover.Body>
        </Popover>
      </Overlay> */}
    </Dropdown>
  );
}
