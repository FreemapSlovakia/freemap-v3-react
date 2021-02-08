import { useMessages } from 'fm3/l10nInjector';
import { ReactElement } from 'react';
import { FaBullseye } from 'react-icons/fa';
import { Selection } from './Selection';

export function TrackingSelection(): ReactElement {
  const m = useMessages();

  return (
    <Selection icon={<FaBullseye />} title={m?.selections.tracking} deletable />
  );
}
