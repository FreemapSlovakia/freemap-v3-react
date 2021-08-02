import { useMessages } from 'fm3/l10nInjector';
import {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
} from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { FaChevronLeft } from 'react-icons/fa';

type Ctx = {
  onBack(): void;
  onClose(): void;
};

const SubmenuContext = createContext<Ctx | undefined>(undefined);

type CtxProps = Ctx & {
  children: ReactNode;
};

export function MenuProvier({
  onBack,
  onClose,
  children,
}: CtxProps): JSX.Element {
  const ctx = useMemo(
    () => ({
      onBack,
      onClose,
    }),
    [onBack, onClose],
  );

  return (
    <SubmenuContext.Provider value={ctx}>{children}</SubmenuContext.Provider>
  );
}

type SubmenuHeaderProps = {
  icon: ReactElement;
  title?: string;
};

export function useMenuClose(): () => void {
  const ctx = useContext(SubmenuContext);

  if (!ctx) {
    throw new Error('not in MenuProvier');
  }

  return ctx.onClose;
}

export function SubmenuHeader({
  icon,
  title,
}: SubmenuHeaderProps): JSX.Element {
  const ctx = useContext(SubmenuContext);

  if (!ctx) {
    throw new Error('not in MenuProvier');
  }

  const m = useMessages();

  return (
    <>
      <Dropdown.Header>
        {icon} {title}
      </Dropdown.Header>
      <Dropdown.Item as="button" onSelect={ctx.onBack}>
        <FaChevronLeft /> {m?.mainMenu.back} <kbd>Esc</kbd>
      </Dropdown.Item>
      <Dropdown.Divider />
    </>
  );
}
