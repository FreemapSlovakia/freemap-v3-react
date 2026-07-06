import { OpenInExternalAppDropdownItems } from '@features/openInExternalApp/components/OpenInExternalAppMenuItems.js';
import { useOpenInExternalAppMessages } from '@features/openInExternalApp/translations/useOpenInExternalAppMessages.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { Fragment, type ReactElement } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { SubmenuHeader } from './SubmenuHeader.js';

export function OpenExternallySubmenu(): ReactElement {
  const lat = useAppSelector((state) => state.map.lat);

  const lon = useAppSelector((state) => state.map.lon);

  const zoom = useAppSelector((state) => state.map.zoom);

  const oeam = useOpenInExternalAppMessages();

  return (
    <Fragment key="openExternally">
      <SubmenuHeader
        icon={<FaExternalLinkAlt />}
        title={oeam?.openInExternal}
      />

      <OpenInExternalAppDropdownItems
        lat={lat}
        lon={lon}
        zoom={zoom}
        showKbdShortcut
      />
    </Fragment>
  );
}
