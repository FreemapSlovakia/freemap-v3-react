import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { Component, ReactNode } from 'react';
import { useSelector } from 'react-redux';

interface State {
  error?: Error;
}

function Error() {
  const m = useMessages();

  const errorTicketId = useSelector(
    (state: RootState) => state.main.errorTicketId,
  );

  return m ? (
    <div
      className="p-2"
      dangerouslySetInnerHTML={{
        __html: m.errorCatcher.html(errorTicketId ?? '???'),
      }}
    />
  ) : null;
}

export class ErrorCatcher extends Component<unknown, State> {
  state: State = {};

  componentDidCatch(error: Error): void {
    console.error(error);
    this.setState({ error });
  }

  render(): ReactNode {
    return this.state.error ? <Error /> : this.props.children;
  }
}
