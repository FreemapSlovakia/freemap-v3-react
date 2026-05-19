import { setActiveModal } from '@app/store/actions.js';
import { DrawingRecentColors } from '@features/drawing/components/DrawingRecentColors.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { ReactElement, SubmitEvent, useCallback, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { trackViewerSetLineStyle } from '../model/actions.js';

type Props = { show: boolean };

export default TrackViewerLineStyleModal;

export function TrackViewerLineStyleModal({ show }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const lineColor = useAppSelector((state) => state.trackViewer.lineColor);

  const lineWidth = useAppSelector((state) => state.trackViewer.lineWidth);

  const [editedColor, setEditedColor] = useState(lineColor);

  const [editedWidth, setEditedWidth] = useState(String(lineWidth));

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();

    dispatch(
      trackViewerSetLineStyle({
        lineColor: editedColor,
        lineWidth: Number(editedWidth) || 6,
      }),
    );

    dispatch(setActiveModal(null));
  };

  const widthNum = parseFloat(editedWidth) || 6;

  const previewHeight = Math.max(20, widthNum + 12);

  return (
    <Modal show={show} onHide={close}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{m?.trackViewer.lineStyle.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group controlId="trackLineColor" className="mt-3">
            <Form.Label>{m?.drawing.edit.color}</Form.Label>

            <Form.Control
              type="color"
              value={editedColor}
              onChange={(e) => setEditedColor(e.currentTarget.value)}
            />

            <DrawingRecentColors onColor={setEditedColor} />
          </Form.Group>

          <Form.Group controlId="trackLineWidth" className="mt-3">
            <Form.Label>{m?.drawing.edit.width}</Form.Label>

            <Form.Control
              type="number"
              value={editedWidth}
              min={1}
              max={20}
              onChange={(e) => setEditedWidth(e.currentTarget.value)}
            />
          </Form.Group>

          <Form.Group controlId="trackLinePreview" className="mt-3">
            <svg width="100%" height={previewHeight} style={{ display: 'block' }}>
              <line
                x1="4"
                y1="50%"
                x2="96%"
                y2="50%"
                stroke={editedColor}
                strokeWidth={widthNum}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button type="submit">
            <FaCheck /> {m?.general.save}
          </Button>

          <Button variant="dark" type="button" onClick={close}>
            <FaTimes /> {m?.general.cancel}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
