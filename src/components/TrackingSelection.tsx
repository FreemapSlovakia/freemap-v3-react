import { ReactElement } from 'react';
import { FaBullseye } from 'react-icons/fa';
import { useMessages } from '../l10nInjector.js';
import { Selection } from './Selection.js';

export function TrackingSelection(): ReactElement {
  const m = useMessages();

  return (
    <Selection icon={<FaBullseye />} title={m?.selections.tracking} deletable />
  );
}
