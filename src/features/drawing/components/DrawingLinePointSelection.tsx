import { useMessages } from '@features/l10n/l10nInjector.js';
import { ActionIcon, Button } from '@mantine/core';
import { MantineLongPressTooltip } from '@shared/components/MantineLongPressTooltip.js';
import { Selection } from '@shared/components/Selection.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { CgArrowsMergeAltH } from 'react-icons/cg';
import { FaDrawPolygon, FaRegPlayCircle, FaTimes } from 'react-icons/fa';
import { MdTimeline } from 'react-icons/md';
import { RiScissorsFill } from 'react-icons/ri';
import { useDispatch } from 'react-redux';
import {
  drawingLineContinue,
  drawingLineJoinStart,
  drawingLineSplit,
} from '../model/actions/drawingLineActions.js';

export default DrawingLinePointSelection;

export function DrawingLinePointSelection(): ReactElement | null {
  const dispatch = useDispatch();

  const m = useMessages();

  const selection = useAppSelector((state) => state.main.selection);

  const line = useAppSelector((state) =>
    state.main.selection?.type === 'line-point'
      ? state.drawingLines.lines[state.main.selection.lineIndex]
      : undefined,
  );

  const joining = useAppSelector(
    (state) => state.drawingLines.joinWith !== undefined,
  );

  if (
    !line ||
    selection?.type !== 'line-point' ||
    joining /* TODO show joining toolbar */
  ) {
    return (
      <Toolbar className="mt-2">
        <span className="me-2">{m?.drawing.selectPointToJoin}</span>

        <MantineLongPressTooltip
          breakpoint="sm"
          kbd="Esc"
          label={m?.general.cancel}
        >
          {({ label, labelHidden, kbdEl, props }) =>
            labelHidden ? (
              <ActionIcon
                variant="filled"
                color="gray"
                size="input-sm"
                onClick={() => {
                  dispatch(drawingLineJoinStart(undefined));
                }}
                {...props}
              >
                <FaTimes />
              </ActionIcon>
            ) : (
              <Button
                color="gray"
                size="sm"
                leftSection={<FaTimes />}
                rightSection={kbdEl}
                onClick={() => {
                  dispatch(drawingLineJoinStart(undefined));
                }}
                {...props}
              >
                {label}
              </Button>
            )
          }
        </MantineLongPressTooltip>
      </Toolbar>
    );
  }

  const pt = {
    lineIndex: selection.lineIndex,
    pointId: selection.pointId,
  };

  const end =
    selection.pointId === line.points[0].id ||
    selection.pointId === line.points.at(-1)?.id;

  return (
    <Selection
      icon={line.type === 'line' ? <MdTimeline /> : <FaDrawPolygon />}
      label={
        line.type === 'line'
          ? m?.selections.linePoint
          : m?.selections.polygonPoint
      }
      deletable={line.points.length > (line.type === 'line' ? 2 : 3)}
    >
      {line.type === 'line' && !end && (
        <MantineLongPressTooltip breakpoint="sm" label={m?.drawing.split}>
          {({ label, labelHidden, props }) =>
            labelHidden ? (
              <ActionIcon
                className="ms-1"
                variant="filled"
                color="gray"
                size="input-sm"
                onClick={() => dispatch(drawingLineSplit(pt))}
                {...props}
              >
                <RiScissorsFill />
              </ActionIcon>
            ) : (
              <Button
                className="ms-1"
                color="gray"
                size="sm"
                leftSection={<RiScissorsFill />}
                onClick={() => dispatch(drawingLineSplit(pt))}
                {...props}
              >
                {label}
              </Button>
            )
          }
        </MantineLongPressTooltip>
      )}

      {line.type === 'line' && end && (
        <MantineLongPressTooltip breakpoint="sm" label={m?.drawing.join}>
          {({ label, labelHidden, props }) =>
            labelHidden ? (
              <ActionIcon
                className="ms-1"
                variant="filled"
                color="gray"
                size="input-sm"
                onClick={() => dispatch(drawingLineJoinStart(pt))}
                {...props}
              >
                <CgArrowsMergeAltH />
              </ActionIcon>
            ) : (
              <Button
                className="ms-1"
                color="gray"
                size="sm"
                leftSection={<CgArrowsMergeAltH />}
                onClick={() => dispatch(drawingLineJoinStart(pt))}
                {...props}
              >
                {label}
              </Button>
            )
          }
        </MantineLongPressTooltip>
      )}

      {line.type === 'line' && end && (
        <MantineLongPressTooltip breakpoint="sm" label={m?.drawing.continue}>
          {({ label, labelHidden, props }) =>
            labelHidden ? (
              <ActionIcon
                className="ms-1"
                variant="filled"
                color="gray"
                size="input-sm"
                onClick={() => dispatch(drawingLineContinue(pt))}
                {...props}
              >
                <FaRegPlayCircle />
              </ActionIcon>
            ) : (
              <Button
                className="ms-1"
                color="gray"
                size="sm"
                leftSection={<FaRegPlayCircle />}
                onClick={() => dispatch(drawingLineContinue(pt))}
                {...props}
              >
                {label}
              </Button>
            )
          }
        </MantineLongPressTooltip>
      )}
    </Selection>
  );
}
