import { useMessages } from '@features/l10n/l10nInjector.js';
import type { ActionProps } from '@shared/components/ResponsiveActions.js';
import { FaBook } from 'react-icons/fa';
import { useOpenManual } from './useOpenManual.js';

/**
 * Props of a toolbar's `Action` opening the manual at a chapter: in its ⋮ while
 * that holds anything else, a button of its own otherwise.
 */
export function useManualAction(): (chapter: string) => ActionProps {
  const m = useMessages();

  const openManual = useOpenManual('toolbar');

  return (chapter) => ({
    label: m?.mainMenu.manual,
    icon: <FaBook />,
    menuWhenShared: true,
    href: `#show=manual/${chapter}`,
    onClick: (e) => {
      e.preventDefault();

      openManual(chapter);
    },
  });
}
