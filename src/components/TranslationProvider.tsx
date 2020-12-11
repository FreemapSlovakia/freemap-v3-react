import { RootState } from 'fm3/storeCreator';
import { Messages } from 'fm3/translations/messagesInterface';
import { createContext, ReactElement, ReactNode } from 'react';
import { useSelector } from 'react-redux';

const MessagesContext = createContext<Messages | undefined>(undefined);

type Props = { children: ReactNode };

export function MessagesProvider({ children }: Props): ReactElement {
  useSelector((state: RootState) => state.l10n.counter);

  return (
    <MessagesContext.Provider value={window.translations}>
      {children}
    </MessagesContext.Provider>
  );
}
