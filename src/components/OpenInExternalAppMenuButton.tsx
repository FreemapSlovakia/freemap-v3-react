import { JSX, ReactElement } from 'react';
import type { OverlayProps } from 'react-bootstrap';
import { Dropdown } from 'react-bootstrap';
import { fixedPopperConfig } from '../fixedPopperConfig.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useMenuHandler } from '../hooks/useMenuHandler.js';
import { useScrollClasses } from '../hooks/useScrollClasses.js';
import { useMessages } from '../l10nInjector.js';
import type { LatLon } from '../types/common.js';
import { OpenInExternalAppDropdownItems } from './OpenInExternalAppMenuItems.js';

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

  const { handleSelect, menuShown, handleMenuToggle } = useMenuHandler({
    pointTitle,
    pointDescription,
  });

  const mapType = useAppSelector((state) => state.map.mapType);

  const zoom = useAppSelector((state) => state.map.zoom);

  const sc = useScrollClasses('vertical');

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

      <Dropdown.Menu
        popperConfig={fixedPopperConfig}
        className="fm-dropdown-with-scroller"
      >
        <div className="fm-menu-scroller" ref={sc}>
          <div />

          <OpenInExternalAppDropdownItems
            lat={lat}
            lon={lon}
            zoom={zoom}
            mapType={mapType}
            includePoint={includePoint}
            url={url}
          />
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
}
