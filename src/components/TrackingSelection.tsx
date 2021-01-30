import { useMessages } from 'fm3/l10nInjector';
import { ReactElement } from 'react';
import { Selection } from './Selection';

export function TrackingSelection(): ReactElement {
  const m = useMessages();

  return <Selection icon="bullseye" title={m?.selections.tracking} deletable />;
}
