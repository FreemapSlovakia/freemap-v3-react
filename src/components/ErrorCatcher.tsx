import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useMessages } from '../l10nInjector.js';

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
    console.error(info.digest);

    console.error(info.componentStack);

    this.setState({ error });
  }

  render(): ReactNode {
    return this.state.error ? <Error /> : this.props.children;
  }
}
