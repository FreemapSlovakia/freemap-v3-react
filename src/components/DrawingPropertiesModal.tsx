import { polygon } from '@turf/helpers';
import {
  ChangeEvent,
  FormEvent,
  ReactElement,
  useCallback,
  useState,
} from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { drawingLineChangeProperties } from '../actions/drawingLineActions.js';
import { drawingPointChangeProperties } from '../actions/drawingPointActions.js';
import { setActiveModal } from '../actions/mainActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { colors } from '../constants.js';
import { useAppSelector } from '../hooks/reduxSelectHook.js';
import { useMessages } from '../l10nInjector.js';
import { DrawingRecentColors } from './DrawingRecentColors.js';

type Props = { show: boolean };

export function DrawingEditLabelModal({ show }: Props): ReactElement {
  const m = useMessages();

  const label = useAppSelector((state) => {
    const { selection } = state.main;

    return selection?.type === 'draw-points' && selection.id !== undefined
      ? (state.drawingPoints.points[selection.id]?.label ?? '')
      : selection?.type === 'draw-line-poly' && selection.id !== undefined
        ? (state.drawingLines.lines[selection.id]?.label ?? '')
        : '???';
  });

  const color = useAppSelector((state) => {
    const { selection } = state.main;

    return selection?.type === 'draw-points' && selection.id !== undefined
      ? state.drawingPoints.points[selection.id]?.color
      : selection?.type === 'draw-line-poly' && selection.id !== undefined
        ? state.drawingLines.lines[selection.id]?.color
        : '???';
  });

  const width = useAppSelector((state) => {
    const { selection } = state.main;

    return selection?.type === 'draw-line-poly' && selection.id !== undefined
      ? state.drawingLines.lines[selection.id]?.width
      : '???';
  });

  const type = useAppSelector((state) => {
    const { selection } = state.main;

    return selection?.type === 'draw-line-poly'
      ? state.drawingLines.lines[selection.id]?.type
      : undefined;
  });

  const polyPoints = useAppSelector((state) => {
    const { selection } = state.main;

    return selection?.type === 'draw-line-poly'
      ? state.drawingLines.lines[selection.id]?.points
      : undefined;
  });

  const drawType = useAppSelector((state) => state.main.selection?.type);

  const selection = useAppSelector((state) => state.main.selection);

  const [editedLabel, setEditedLabel] = useState(label);

  const [editedColor, setEditedColor] = useState(color);

  const [editedWidth, setEditedWidth] = useState(String(width || 4));

  const [editedType, setEditedType] = useState<'polygon' | 'line'>(
    type ?? 'line',
  );

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      if (
        selection?.type !== 'draw-line-poly' &&
        selection?.type !== 'draw-points'
      ) {
        return;
      }

      e.preventDefault();

      if (polyPoints && editedLabel === 'cry me a river') {
        const pixelSize = window.prompt('Pixel size?');

        if (pixelSize == null) {
          return;
        }

        const threshold = window.prompt('Stream threshold?', '20000');

        if (!threshold) {
          return;
        }

        const minLen = window.prompt('Minimum stream length?', '50');

        if (!minLen) {
          return;
        }

        const simplifyTolerance = window.prompt('Simplify tolerance?', '1.5');

        if (!simplifyTolerance) {
          return;
        }

        const inJosm = window.confirm('Open in JSOM?');

        const toOsm =
          inJosm || window.confirm('Write as OSM? (otherwise ad GeoJSON)');

        const q = new URLSearchParams({
          threshold,
          'min-len': minLen,
          'simplify-tolerance': simplifyTolerance,
          mask: JSON.stringify(
            polygon([
              [...polyPoints, polyPoints[0]].map((p) => [p.lon, p.lat]),
            ]),
          ),
        });

        if (pixelSize) {
          q.append('pixel-size', pixelSize);
        }

        if (toOsm) {
          q.append('to-osm', '1');
        }

        if (inJosm) {
          fetch(
            'http://localhost:8111/import?new_layer=true&url=' +
              encodeURIComponent('http://fm3.freemap.sk:8080?' + q.toString()),
          )
            .then((res) => {
              if (!res.ok) {
                throw new Error(
                  'Error response from localhost:8111: ' + res.status,
                );
              }
            })
            .catch((err) => {
              dispatch?.(
                toastsAdd({
                  messageKey: 'general.operationError',
                  messageParams: { err },
                  style: 'danger',
                }),
              );
            });
        } else {
          const aElem = document.createElement('a');

          aElem.href = 'http://fm3.freemap.sk:8080?' + q.toString();

          aElem.target = '_blank';

          aElem.click();
        }

        return;
      }

      if (polyPoints && editedLabel === 'run forest run') {
        const classifications = window.prompt('Classifications?', '4,5');

        if (!classifications) {
          return;
        }

        const inJosm = window.confirm('Open in JSOM?');

        const toOsm =
          inJosm || window.confirm('Write as OSM? (otherwise ad GeoJSON)');

        const q = new URLSearchParams({
          classifications,
          mask: JSON.stringify(
            polygon([
              [...polyPoints, polyPoints[0]].map((p) => [p.lon, p.lat]),
            ]),
          ),
          'to-osm': toOsm ? '1' : '',
        });

        if (inJosm) {
          fetch(
            'http://localhost:8111/import?new_layer=true&url=' +
              encodeURIComponent('http://fm3.freemap.sk:8085?' + q.toString()),
          )
            .then((res) => {
              if (!res.ok) {
                throw new Error(
                  'Error response from localhost:8111: ' + res.status,
                );
              }
            })
            .catch((err) => {
              dispatch?.(
                toastsAdd({
                  messageKey: 'general.operationError',
                  messageParams: { err },
                  style: 'danger',
                }),
              );
            });
        } else {
          const aElem = document.createElement('a');

          aElem.href = 'http://fm3.freemap.sk:8085?' + q.toString();

          aElem.target = '_blank';

          aElem.click();
        }

        return;
      }

      dispatch(
        selection.type === 'draw-line-poly'
          ? drawingLineChangeProperties({
              index: selection.id,
              properties: {
                label: editedLabel || undefined,
                color: editedColor,
                width: Number(editedWidth) || undefined,
                type: editedType,
              },
            })
          : drawingPointChangeProperties({
              index: selection.id,
              properties: {
                label: editedLabel || undefined,
                color: editedColor,
              },
            }),
      );

      close();
    },
    [
      polyPoints,
      editedLabel,
      dispatch,
      editedColor,
      editedWidth,
      editedType,
      close,
      selection,
    ],
  );

  const handleLocalLabelChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setEditedLabel(e.currentTarget.value);
    },
    [],
  );

  const handleLocalColorChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setEditedColor(e.currentTarget.value);
    },
    [],
  );

  const handleLocalWidthChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setEditedWidth(e.currentTarget.value);
    },
    [],
  );

  return (
    <Modal show={show} onHide={close}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{m?.drawing.edit.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>{m?.drawing.edit.label}</Form.Label>

            <Form.Control
              autoFocus
              type="text"
              value={editedLabel ?? ''}
              onChange={handleLocalLabelChange}
            />
          </Form.Group>

          <Alert variant="secondary" className="mb-3">
            {m?.drawing.edit.hint}
          </Alert>

          <Form.Group className="mb-3">
            <Form.Label>{m?.drawing.edit.color}</Form.Label>

            <Form.Control
              type="color"
              value={editedColor || colors.normal}
              onChange={handleLocalColorChange}
            />

            <DrawingRecentColors onColor={(color) => setEditedColor(color)} />
          </Form.Group>

          {drawType === 'draw-line-poly' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>{m?.drawing.edit.width}</Form.Label>

                <Form.Control
                  type="number"
                  value={editedWidth}
                  min={1}
                  max={12}
                  step={0.1}
                  onChange={handleLocalWidthChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>{m?.drawing.edit.type}:</Form.Label>

                <Form.Control
                  as="select"
                  value={editedType}
                  onChange={(e) =>
                    setEditedType(e.currentTarget.value as 'polygon' | 'line')
                  }
                >
                  <option value="line">{m?.selections.drawLines}</option>
                  <option value="polygon">{m?.selections.drawPolygons}</option>
                </Form.Control>
              </Form.Group>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button type="submit" variant="info">
            <FaCheck /> {m?.general.save}
          </Button>

          <Button variant="dark" type="button" onClick={close}>
            <FaTimes /> {m?.general.cancel} <kbd>Esc</kbd>
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default DrawingEditLabelModal;
