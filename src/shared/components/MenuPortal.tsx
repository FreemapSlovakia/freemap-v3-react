import RestartDropdownContext, {
  type DropdownContextValue,
} from '@restart/ui/DropdownContext';
import { type Context, type ReactNode, useContext } from 'react';
import { createPortal } from 'react-dom';

// NodeNext types the package's untyped-ESM default import as its namespace.
const DropdownContext =
  RestartDropdownContext as unknown as Context<DropdownContextValue | null>;

/**
 * Renders a dropdown's menu into `document.body`, out of clipping scrollers and
 * stacking contexts. Not in a modal: its `enforceFocus` would steal the focus.
 */
export function MenuPortal({ children }: { children: ReactNode }): ReactNode {
  const toggle = useContext(DropdownContext)?.toggleElement;

  // Portal while the toggle is still unknown, so the menu never remounts out of
  // the toolbar once it is.
  return toggle?.closest('.modal')
    ? children
    : createPortal(children, document.body);
}
