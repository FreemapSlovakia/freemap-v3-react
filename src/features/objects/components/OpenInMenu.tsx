import { useMessages } from '@features/l10n/l10nInjector.js';
import { useOpenInExternalAppMessages } from '@features/openInExternalApp/translations/useOpenInExternalAppMessages.js';
import type { SelectCallback } from '@restart/ui/types';
import { FmCollapsibleLabel } from '@shared/components/FmModalFooter.js';
import {
  ActionItems,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
import type { ReactElement, ReactNode } from 'react';
import { FaEllipsisV, FaExternalLinkAlt } from 'react-icons/fa';

/** A menu's toggle in an `FmModalFooter` row: its glyph, labelled while it has the room. */
function MenuToggle({
  icon,
  label,
  priority,
}: {
  icon: ReactNode;
  label: ReactNode;
  priority: number;
}): ReactElement {
  return (
    <>
      {icon}
      <FmCollapsibleLabel priority={priority}>{label}</FmCollapsibleLabel>
    </>
  );
}

/** A ⋮ menu's toggle, labelled like {@link OpenInMenu}'s. */
export function ActionsToggle({
  priority,
}: {
  priority: number;
}): ReactElement {
  const m = useMessages();

  return (
    <MenuToggle
      icon={<FaEllipsisV />}
      label={m?.general.actions}
      priority={priority}
    />
  );
}

/**
 * `useObjectActions`' "Open in…" items, as a menu of their own; labelled in an
 * `FmModalFooter` row while it has the room.
 */
export function OpenInMenu({
  items,
  onSelect,
  priority = 0,
}: {
  items: ReactNode;
  onSelect: SelectCallback;
  /** When its label goes, as an `FmFooterButton`'s. */
  priority?: number;
}): ReactElement | null {
  const oeam = useOpenInExternalAppMessages();

  return items ? (
    <ResponsiveActions
      toggle={
        <MenuToggle
          icon={<FaExternalLinkAlt />}
          label={oeam?.openIn}
          priority={priority}
        />
      }
      toggleLabel={oeam?.openIn}
      onSelect={onSelect}
    >
      <ActionItems>{items}</ActionItems>
    </ResponsiveActions>
  ) : null;
}
