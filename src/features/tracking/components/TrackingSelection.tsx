import type { ReactElement } from 'react';
import { FaBullseye } from 'react-icons/fa';
import { useMessages } from '../../../l10nInjector.js';
import { Selection } from '../../../components/Selection.js';

export function TrackingSelection(): ReactElement {
  const m = useMessages();

  return (
    <Selection icon={<FaBullseye />} label={m?.selections.tracking} deletable />
  );
}
