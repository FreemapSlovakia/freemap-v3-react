import { openTool } from '@app/store/actions.js';
import { isToolOpen } from '@app/store/selectors.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { MdShapeLine } from 'react-icons/md';
import { useDispatch } from 'react-redux';

export function DataViewerToggleButton(): ReactElement {
  const open = useAppSelector((state) => isToolOpen(state, 'import-file'));

  const m = useMessages();

  const dispatch = useDispatch();

  return (
    <LongPressTooltip label={m?.tools.dataViewer}>
      {({ props }) => (
        <Button
          {...props}
          variant="dark"
          disabled={open}
          onClick={() => dispatch(openTool('import-file'))}
        >
          <MdShapeLine />
        </Button>
      )}
    </LongPressTooltip>
  );
}
