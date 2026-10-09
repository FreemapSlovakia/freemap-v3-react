import { openTool, setActiveModal, ToolSchema } from '@app/store/actions.js';
import { openDrawToolSelector } from '@app/store/selectors.js';
import type { RootState } from '@app/store/store.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { BatchPropertiesDropdown } from '@shared/components/BatchPropertiesItems.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { SelectDropdown } from '@shared/components/SelectDropdown.js';
import { ToolMenu } from '@shared/components/ToolMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { toolDefinitions } from '@shared/toolDefinitions.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaPaintBrush } from 'react-icons/fa';
import { shallowEqual, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { drawingBatchCounts } from '../featureProperties.js';
import { useDrawingMessages } from '../translations/useDrawingMessages.js';

// Counted again only when the drawing changes, not on every action.
const batchCountsSelector = createSelector(
  [
    (state: RootState) => state.drawingPoints.points,
    (state: RootState) => state.drawingLines.lines,
  ],
  drawingBatchCounts,
);

export default function DrawingMenu(): ReactElement | undefined {
  const drawTool = useAppSelector(openDrawToolSelector);

  const drawToolDef =
    (drawTool ?? undefined) &&
    toolDefinitions.find((td) => td.tool === drawTool);

  const dispatch = useDispatch();

  const m = useMessages();

  const dm = useDrawingMessages();

  // Counts, not the features: drawing one must not re-render the toolbar.
  const batchCounts = useAppSelector(batchCountsSelector, shallowEqual);

  return (
    drawToolDef && (
      <ToolMenu tool={drawToolDef.tool}>
        <SelectDropdown
          breakpoint="lg"
          name={m?.general.drawingTool}
          value={drawTool}
          onSelect={(tool) => dispatch(openTool(ToolSchema.parse(tool)))}
          options={toolDefinitions
            .filter((td) => td.draw)
            .map(({ tool, icon, msgKey: key, kbd }) => ({
              value: tool,
              label: m?.selections[key as 'drawPoints'] ?? '…',
              icon,
              kbd: `g ${kbd?.slice(3).toLowerCase()}`,
            }))}
        />

        <LongPressTooltip label={dm?.defProps.menuItem} kbd="e d">
          {({ props }) => (
            <Button
              variant="secondary"
              onClick={() =>
                dispatch(setActiveModal({ type: 'drawing-properties' }))
              }
              {...props}
            >
              <FaPaintBrush />
            </Button>
          )}
        </LongPressTooltip>

        <BatchPropertiesDropdown
          modal="drawing-batch-properties"
          counts={batchCounts}
        />
      </ToolMenu>
    )
  );
}
