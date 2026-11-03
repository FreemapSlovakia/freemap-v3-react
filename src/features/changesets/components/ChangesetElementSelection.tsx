import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { DIFF_COLORS } from '../model/changesetDiff.js';
import { selectedDiffElementSelector } from '../model/selectors.js';
import { diffElementIcon } from './ElementTypeIcon.js';
import { useElementName } from './useElementName.js';

export default function ChangesetElementSelection(): ReactElement | null {
  const element = useAppSelector(selectedDiffElementSelector);

  const { text } = useElementName();

  if (!element) {
    return null;
  }

  const Icon = diffElementIcon(element);

  return (
    <Selection
      icon={<Icon color={DIFF_COLORS[element.action]} />}
      label={text(element)}
    />
  );
}
