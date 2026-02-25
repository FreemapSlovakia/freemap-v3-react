import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  error?: Error;
}

function Error() {
  const m = useMessages();

  const errorTicketId = useAppSelector((state) => state.main.errorTicketId);

  return m ? (
    <div
      className="p-2"
      dangerouslySetInnerHTML={{
        __html: m.errorCatcher.html(errorTicketId),
      }}
    />
  ) : null;
}

type Props = {
  children: ReactNode;
};

export class ErrorCatcher extends Component<Props, State> {
  state: State = {};

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(info.componentStack);

    this.setState({ error });
  }

  render(): ReactNode {
    return this.state.error ? <Error /> : this.props.children;
  }
}
