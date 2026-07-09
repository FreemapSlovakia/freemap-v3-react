import { setTool, type Tool } from '@app/store/actions.js';
import { openDrawToolSelector } from '@app/store/selectors.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { toolDefinitions } from '@shared/toolDefinitions.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaPencilRuler } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

type Props = {
  tool: Extract<Tool, 'draw-points' | 'draw-lines' | 'draw-polygons'>;
};

export function DrawingToggleButton({ tool }: Props): ReactElement {
  const open = useAppSelector((state) => openDrawToolSelector(state) !== null);

  const m = useMessages();

  const dispatch = useDispatch();

  const def = toolDefinitions.find((td) => td.tool === tool);

  return (
    <LongPressTooltip label={def && m?.tools[def.msgKey]}>
      {({ props }) => (
        <Button
          {...props}
          variant="dark"
          disabled={open}
          onClick={() => dispatch(setTool({ tool, mode: 'open' }))}
        >
          <FaPencilRuler />
        </Button>
      )}
    </LongPressTooltip>
  );
}
