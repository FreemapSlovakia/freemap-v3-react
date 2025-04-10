import { createContext, ReactElement, ReactNode } from 'react';
import { useAppSelector } from '../hooks/reduxSelectHook.js';
import { Messages } from '../translations/messagesInterface.js';

const MessagesContext = createContext<Messages | undefined>(undefined);

type Props = { children: ReactNode };

export function MessagesProvider({ children }: Props): ReactElement {
  useAppSelector((state) => state.l10n.counter);

  return (
    <MessagesContext.Provider value={window.translations}>
      {children}
    </MessagesContext.Provider>
  );
}
