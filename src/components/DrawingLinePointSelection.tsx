import {
  drawingLineContinue,
  drawingLineJoinStart,
  drawingLineSplit,
} from 'fm3/actions/drawingLineActions';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/esm/Card';
import { CgArrowsMergeAltH } from 'react-icons/cg';
import { FaDrawPolygon, FaRegPlayCircle, FaTimes } from 'react-icons/fa';
import { MdTimeline } from 'react-icons/md';
import { RiScissorsFill } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import { Selection } from './Selection';

export function DrawingLinePointSelection(): ReactElement | null {
  const dispatch = useDispatch();

  const m = useMessages();

  const selection = useSelector((state) => state.main.selection);

  const line = useSelector((state) =>
    state.main.selection?.type === 'line-point'
      ? state.drawingLines.lines[state.main.selection.lineIndex]
      : undefined,
  );

  const joining = useSelector(
    (state) => state.drawingLines.joinWith !== undefined,
  );

  if (
    !line ||
    selection?.type !== 'line-point' ||
    joining /* TODO show joining toolbar */
  ) {
    return (
      <Card className="fm-toolbar mx-2 mt-2">
        <span className="mr-2">{m?.drawing.selectPointToJoin}</span>
        <Button
          variant="secondary"
          onClick={() => {
            dispatch(drawingLineJoinStart(undefined));
          }}
        >
          <FaTimes />
          <span className="d-none d-sm-inline"> {m?.general.cancel}</span>{' '}
          <kbd>Esc</kbd>
        </Button>
      </Card>
    );
  }

  const pt = {
    lineIndex: selection.lineIndex,
    pointId: selection.pointId,
  };

  const end =
    selection.pointId === line.points[0].id ||
    selection.pointId === line.points[line.points.length - 1].id;

  return (
    <Selection
      icon={line.type === 'line' ? <MdTimeline /> : <FaDrawPolygon />}
      title={
        line.type === 'line'
          ? m?.selections.linePoint
          : m?.selections.polygonPoint
      }
      deletable={line.points.length > (line.type === 'line' ? 2 : 3)}
    >
      {line.type === 'line' && !end && (
        <Button
          className="ml-1"
          variant="secondary"
          onClick={() => dispatch(drawingLineSplit(pt))}
        >
          <RiScissorsFill />
          <span className="d-none d-sm-inline"> {m?.drawing.split}</span>
        </Button>
      )}

      {line.type === 'line' && end && (
        <Button
          className="ml-1"
          variant="secondary"
          onClick={() => dispatch(drawingLineJoinStart(pt))}
        >
          <CgArrowsMergeAltH />
          <span className="d-none d-sm-inline"> {m?.drawing.join}</span>
        </Button>
      )}

      {line.type === 'line' && end && (
        <Button
          className="ml-1"
          variant="secondary"
          onClick={() => dispatch(drawingLineContinue(pt))}
        >
          <FaRegPlayCircle />
          <span className="d-none d-sm-inline"> {m?.drawing.continue}</span>
        </Button>
      )}
    </Selection>
  );
}
