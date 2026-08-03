import { useOpenInExternalAppMessages } from '@features/openInExternalApp/translations/useOpenInExternalAppMessages.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useMenuHandler } from '@shared/hooks/useMenuHandler.js';
import type { LatLon } from '@shared/types/common.js';
import type { JSX, ReactElement } from 'react';
import type { OverlayProps } from 'react-bootstrap';
import { Dropdown } from 'react-bootstrap';
import { OpenInExternalAppDropdownItems } from './OpenInExternalAppMenuItems.js';

interface Props extends LatLon {
  lat: number;
  lon: number;
  placement?: OverlayProps['placement'];
  includePoint?: boolean;
  pointTitle?: string;
  pointDescription?: string;
  url?: string;
  /** The picture itself, where there is one — what the `image` target shares as a file. */
  imageUrl?: string;
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
  imageUrl,
  children,
  className,
}: Props): ReactElement {
  const oeam = useOpenInExternalAppMessages();

  // `url` deliberately stays out of this: it is what the "New window" item opens, which for a
  // gallery photo is the picture's own address, `hmac` token and all. "Share location" shares the
  // page the user is on instead, which is the address worth passing to someone else.
  const { handleSelect, menuShown, handleMenuToggle } = useMenuHandler({
    pointTitle,
    pointDescription,
    imageUrl,
  });

  const zoom = useAppSelector((state) => state.map.zoom);

  return (
    <Dropdown
      placement={placement}
      className={className}
      onSelect={handleSelect}
      show={menuShown}
      onToggle={handleMenuToggle}
    >
      <Dropdown.Toggle variant="secondary" title={oeam?.openInExternal}>
        {children}
      </Dropdown.Toggle>

      <FmDropdownMenu>
        <OpenInExternalAppDropdownItems
          lat={lat}
          lon={lon}
          zoom={zoom}
          includePoint={includePoint}
          url={url}
          imageUrl={imageUrl}
        />
      </FmDropdownMenu>
    </Dropdown>
  );
}
