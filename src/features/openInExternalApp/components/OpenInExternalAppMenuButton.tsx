import { useMessages } from '@features/l10n/l10nInjector.js';
import { Button, Menu, ScrollArea } from '@mantine/core';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useMenuHandler } from '@shared/hooks/useMenuHandler.js';
import type { LatLon } from '@shared/types/common.js';
import type { JSX, ReactElement, SyntheticEvent } from 'react';
import type { OverlayProps } from 'react-bootstrap';
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
  ...rest
}: Props): ReactElement {
  const m = useMessages();

  const { handleSelect, menuShown, handleMenuToggle } = useMenuHandler({
    pointTitle,
    pointDescription,
  });

  const zoom = useAppSelector((state) => state.map.zoom);

  return (
    <Menu
      position={placement === 'top' ? 'top' : undefined}
      opened={menuShown}
      onChange={handleMenuToggle}
    >
      <Menu.Target>
        <Button
          color="gray"
          size="sm"
          className={className}
          title={m?.external.openInExternal}
          {...rest}
        >
          {children}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <ScrollArea.Autosize mah="calc(100dvh - 160px)" type="auto">
          <OpenInExternalAppDropdownItems
            lat={lat}
            lon={lon}
            zoom={zoom}
            includePoint={includePoint}
            url={url}
            onSelect={(eventKey) =>
              handleSelect(eventKey, {
                preventDefault() {},
              } as SyntheticEvent<unknown, Event>)
            }
          />
        </ScrollArea.Autosize>
      </Menu.Dropdown>
    </Menu>
  );
}
