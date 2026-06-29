import { setActiveModal, setTool, ToolSchema } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { SelectDropdown } from '@shared/components/SelectDropdown.js';
import { ToolMenu } from '@shared/components/ToolMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { toolDefinitions } from '@shared/toolDefinitions.js';
import { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaPaintBrush } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { openDrawToolSelector } from '@/app/store/selectors.js';
import { useDrawingMessages } from '../translations/useDrawingMessages.js';

export default function DrawingMenu(): ReactElement | undefined {
  const activeTool = useAppSelector(openDrawToolSelector);

  const activeToolDef =
    (activeTool ?? undefined) &&
    toolDefinitions.find((td) => td.tool === activeTool);

  const dispatch = useDispatch();

  const m = useMessages();

  const dm = useDrawingMessages();

  return (
    activeToolDef && (
      <ToolMenu tool={activeToolDef.tool}>
        <SelectDropdown
          className="ms-1"
          breakpoint="lg"
          name={m?.general.drawingTool}
          value={activeTool}
          onSelect={(tool) =>
            dispatch(
              setTool({ tool: ToolSchema.parse(tool), mode: 'activate' }),
            )
          }
          options={toolDefinitions
            .filter((td) => td.draw)
            .map(({ tool, icon, msgKey: key, kbd }) => ({
              value: tool,
              label: m?.selections[key as 'drawPoints'] ?? '…',
              icon,
              kbd: `g ${kbd?.slice(3).toLowerCase()}`,
            }))}
        />

        <LongPressTooltip
          label={dm?.defProps.menuItem}
          breakpoint="md"
          kbd="e d"
        >
          {({ props, label, labelClassName }) => (
            <Button
              variant="secondary"
              className="ms-1"
              onClick={() =>
                dispatch(setActiveModal({ type: 'drawing-properties' }))
              }
              {...props}
            >
              <FaPaintBrush /> <span className={labelClassName}>{label}</span>
            </Button>
          )}
        </LongPressTooltip>
      </ToolMenu>
    )
  );
}
