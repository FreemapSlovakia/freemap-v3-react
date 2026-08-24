import { useOpenInExternalAppMessages } from '@features/openInExternalApp/translations/useOpenInExternalAppMessages.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import type { TooltipTargetProps } from '@shared/components/LongPressTooltip.js';
import { SubmenuHeader } from '@shared/components/SubmenuHeader.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useMenuHandler } from '@shared/hooks/useMenuHandler.js';
import type { LatLon } from '@shared/types/common.js';
import type { JSX, ReactElement, ReactNode } from 'react';
import type { OverlayProps } from 'react-bootstrap';
import { Dropdown } from 'react-bootstrap';
import { FaChevronRight, FaExternalLinkAlt } from 'react-icons/fa';
import {
  hasPageItems,
  OpenInExternalTargetItems,
  SharePageItems,
} from './OpenInExternalAppMenuItems.js';

interface Props extends LatLon {
  lat: number;
  lon: number;
  placement?: OverlayProps['placement'];
  includePoint?: boolean;
  pointTitle?: string;
  /** What the place is, as OSM tags; see the `openInExternalApp` payload. */
  pointTags?: Record<string, string>;
  pointDescription?: string;
  url?: string;
  /** The picture itself, where there is one — what the `image` target shares as a file. */
  imageUrl?: string;
  className?: string;
  /**
   * The tooltip props for the toggle, from a `LongPressTooltip` the caller
   * wraps this in — the toggle is ours, so they can only reach it through here.
   */
  toggleProps?: TooltipTargetProps;
  /** Items the menu carries above the external ones — what else this place can do. */
  menuItems?: ReactNode;
  children: JSX.Element | JSX.Element[];
}

export function OpenInExternalAppMenuButton({
  lat,
  lon,
  placement,
  includePoint,
  pointTitle,
  pointTags,
  pointDescription,
  url,
  imageUrl,
  toggleProps,
  menuItems,
  children,
  className,
}: Props): ReactElement {
  const oeam = useOpenInExternalAppMessages();

  // `url` deliberately stays out of this: it is what the "New window" item opens, which for a
  // gallery photo is the picture's own address, `hmac` token and all. "Share location" shares the
  // page the user is on instead, which is the address worth passing to someone else.
  const { handleSelect, menuShown, handleMenuToggle, submenu } = useMenuHandler(
    {
      pointTitle,
      pointTags,
      pointDescription,
      imageUrl,
      at: { lat, lon },
      includePoint,
    },
  );

  const zoom = useAppSelector((state) => state.map.zoom);

  const pageItems = hasPageItems({ url, imageUrl });

  return (
    <Dropdown
      placement={placement}
      className={className}
      // An item with an `eventKey` closes the menu in `handleSelect`; one
      // without has done its own work here, and opening the submenu must leave
      // the menu up — so closing is nobody's business but ours.
      autoClose="outside"
      onSelect={(eventKey, e) => {
        handleSelect(eventKey, e);

        if (eventKey === null) {
          handleMenuToggle(false);
        }
      }}
      show={menuShown}
      onToggle={handleMenuToggle}
    >
      <Dropdown.Toggle
        variant="secondary"
        // Only where nothing else explains it.
        title={toggleProps ? undefined : oeam?.openInExternal}
        {...toggleProps}
      >
        {children}
      </Dropdown.Toggle>

      <FmDropdownMenu level={submenu}>
        {submenu === 'openExternally' ? (
          <>
            <SubmenuHeader icon={<FaExternalLinkAlt />} title={oeam?.openIn} />

            <OpenInExternalTargetItems
              lat={lat}
              lon={lon}
              zoom={zoom}
              includePoint={includePoint}
              url={url}
            />
          </>
        ) : (
          <>
            {menuItems && (
              <>
                {menuItems}

                <Dropdown.Divider />
              </>
            )}

            <SharePageItems url={url} imageUrl={imageUrl} />

            {pageItems && <Dropdown.Divider />}

            <Dropdown.Item as="button" eventKey="submenu-openExternally">
              <FaExternalLinkAlt /> {oeam?.openIn} <FaChevronRight />
            </Dropdown.Item>
          </>
        )}
      </FmDropdownMenu>
    </Dropdown>
  );
}
