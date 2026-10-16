import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { DIFF_COLORS } from '../model/changesetDiff.js';
import { selectedDiffElementSelector } from '../model/selectors.js';
import { ELEMENT_ICONS } from './elementIcons.js';
import { useElementName } from './useElementName.js';

export default function ChangesetElementSelection(): ReactElement | null {
  const element = useAppSelector(selectedDiffElementSelector);

  const { label } = useElementName();

  if (!element) {
    return null;
  }

  const Icon = ELEMENT_ICONS[element.type];

  return (
    <Selection
      icon={<Icon color={DIFF_COLORS[element.action]} />}
      label={label(element)}
    />
  );
}
