import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useMessages } from 'fm3/l10nInjector';
import { Component, ReactNode } from 'react';

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
        __html: m.errorCatcher.html(errorTicketId ?? '???'),
      }}
    />
  ) : null;
}

type Props = {
  children: ReactNode;
};

export class ErrorCatcher extends Component<Props, State> {
  state: State = {};

  componentDidCatch(error: Error): void {
    this.setState({ error });
  }

  render(): ReactNode {
    return this.state.error ? <Error /> : this.props.children;
  }
}
