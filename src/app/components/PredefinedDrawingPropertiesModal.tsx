import { DrawingLineStyleFields } from '@features/drawing/components/DrawingLineStyleFields.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { Button } from '@mantine/core';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { ReactElement, SubmitEvent, useCallback, useState } from 'react';
import { Form, Modal } from 'react-bootstrap';
import { FaCheck, FaFill, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { applySettings, setActiveModal } from '../store/actions.js';

type Props = { show: boolean };

export default PredefinedDrawingPropertiesModal;

export function PredefinedDrawingPropertiesModal({
  show,
}: Props): ReactElement {
  const m = useMessages();

  const color = useAppSelector((state) => state.drawingSettings.drawingColor);

  const width = useAppSelector((state) => state.drawingSettings.drawingWidth);

  const dashArray = useAppSelector(
    (state) => state.drawingSettings.drawingDashArray,
  );

  const lineCap = useAppSelector(
    (state) => state.drawingSettings.drawingLineCap ?? 'round',
  );

  const lineJoin = useAppSelector(
    (state) => state.drawingSettings.drawingLineJoin ?? 'round',
  );

  const [editedColor, setEditedColor] = useState(color);

  const [editedWidth, setEditedWidth] = useState(String(width));

  const [editedDash, setEditedDash] = useState(dashArray ?? []);

  const [editedLineCap, setEditedLineCap] = useState(lineCap);

  const [editedLineJoin, setEditedLineJoin] = useState(lineJoin);

  const dispatch = useDispatch();

  function save(applyToAll = false) {
    dispatch(
      applySettings({
        drawingColor: editedColor,
        drawingWidth: Number(editedWidth) || 4,
        drawingDash: editedDash.length ? editedDash : undefined,
        drawingLineCap: editedLineCap === 'round' ? undefined : editedLineCap,
        drawingLineJoin:
          editedLineJoin === 'round' ? undefined : editedLineJoin,
        drawingApplyAll: applyToAll,
      }),
    );

    dispatch(setActiveModal(null));
  }

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();

    save(false);
  };

  const handleApplyToAllClick = () => {
    save(true);
  };

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  return (
    <Modal show={show} onHide={close}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{m?.drawing.defProps.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <DrawingLineStyleFields
            color={editedColor}
            onColorChange={setEditedColor}
            width={editedWidth}
            onWidthChange={setEditedWidth}
            widthStep={0.1}
            lineCap={editedLineCap}
            onLineCapChange={setEditedLineCap}
            lineJoin={editedLineJoin}
            onLineJoinChange={setEditedLineJoin}
            dashArray={editedDash}
            onDashArrayChange={setEditedDash}
          />
        </Modal.Body>

        <Modal.Footer>
          <Button type="submit" size="sm" leftSection={<FaCheck />}>
            {m?.general.save}
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            leftSection={<FaFill />}
            onClick={handleApplyToAllClick}
          >
            {m?.drawing.defProps.applyToAll}
          </Button>

          <Button
            type="button"
            color="dark"
            size="sm"
            leftSection={<FaTimes />}
            onClick={close}
          >
            {m?.general.cancel}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
