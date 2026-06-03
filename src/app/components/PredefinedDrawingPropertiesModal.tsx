import { DrawingLineStyleFields } from '@features/drawing/components/DrawingLineStyleFields.js';
import { MarkerTypeSelect } from '@features/drawing/components/MarkerTypeSelect.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { ReactElement, SubmitEvent, useCallback, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { FaCheck, FaFill, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { applySettings, setActiveModal } from '../store/actions.js';

type Props = { show: boolean };

export default function PredefinedDrawingPropertiesModal({
  show,
}: Props): ReactElement {
  const m = useMessages();

  const color = useAppSelector((state) => state.drawingSettings.drawingColor);

  const fillColorPref = useAppSelector(
    (state) => state.drawingSettings.drawingFillColor,
  );

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

  const markerType = useAppSelector(
    (state) => state.drawingSettings.drawingMarkerType,
  );

  const [editedColor, setEditedColor] = useState(color);

  const [editedMarkerType, setEditedMarkerType] = useState(markerType);

  const [editedFillColor, setEditedFillColor] = useState(fillColorPref);

  const [editedWidth, setEditedWidth] = useState(String(width));

  const [editedDash, setEditedDash] = useState(dashArray ?? []);

  const [editedLineCap, setEditedLineCap] = useState(lineCap);

  const [editedLineJoin, setEditedLineJoin] = useState(lineJoin);

  const dispatch = useDispatch();

  function save(applyToAll = false) {
    dispatch(
      applySettings({
        drawingColor: editedColor,
        drawingFillColor: editedFillColor,
        drawingWidth: Number(editedWidth) || 4,
        drawingDash: editedDash.length ? editedDash : undefined,
        drawingLineCap: editedLineCap === 'round' ? undefined : editedLineCap,
        drawingLineJoin:
          editedLineJoin === 'round' ? undefined : editedLineJoin,
        drawingMarkerType: editedMarkerType,
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
    <Modal show={show} onHide={close} contentClassName="bg-body-tertiary">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{m?.drawing.defProps.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <DrawingLineStyleFields
            color={editedColor}
            onColorChange={setEditedColor}
            fillColor={editedFillColor}
            onFillColorChange={setEditedFillColor}
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

          <Form.Group controlId="markerType" className="mt-3">
            <Form.Label>{m?.drawing.edit.shape}</Form.Label>

            <MarkerTypeSelect
              asSelect
              value={editedMarkerType}
              onChange={setEditedMarkerType}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button type="submit">
            <FaCheck /> {m?.general.save}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={handleApplyToAllClick}
          >
            <FaFill /> {m?.drawing.defProps.applyToAll}
          </Button>

          <Button variant="dark" type="button" onClick={close}>
            <FaTimes /> {m?.general.cancel}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
