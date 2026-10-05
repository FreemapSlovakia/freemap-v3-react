import { sendError } from '@app/store/middleware/globalErrorHandler.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  error?: Error;
}

function TheError() {
  const m = useMessages();

  const errorTicketId = useAppSelector((state) => state.main.errorTicketId);

  return (
    <div
      className="p-2"
      dangerouslySetInnerHTML={{
        // the error can come before any translation has loaded
        __html: m
          ? m.errorCatcher.html(errorTicketId)
          : `<h1>Application error</h1><p>Ticket ID: ${errorTicketId ?? '-'}</p><p><a href="">Reload</a></p>`,
      }}
    />
  );
}

type Props = {
  children: ReactNode;
};

export class ErrorCatcher extends Component<Props, State> {
  state: State = {};

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(info.componentStack);

    // React reports an error a boundary caught to the console only.
    sendError({ kind: 'render', error });

    this.setState({ error });
  }

  render(): ReactNode {
    return this.state.error ? <TheError /> : this.props.children;
  }
}
