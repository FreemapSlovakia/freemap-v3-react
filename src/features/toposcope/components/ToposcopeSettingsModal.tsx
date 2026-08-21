import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { ResetToDefaultsButton } from '@shared/components/ResetToDefaultsButton.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useCallback } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { FaCompass, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { toposcopeSet, toposcopeSetInscription } from '../model/actions.js';
import { toposcopeInitialState } from '../model/reducer.js';
import { useToposcopeMessages } from '../translations/useToposcopeMessages.js';

type Props = { show: boolean };

export default function ToposcopeSettingsModal({ show }: Props): ReactElement {
  const m = useMessages();

  const tm = useToposcopeMessages();

  const dispatch = useDispatch();

  const inscriptions = useAppSelector((state) => state.toposcope.inscriptions);

  const settings = useAppSelector((state) => state.toposcope);

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  useDocumentTitle(show ? tm?.settings.title : undefined);

  const c = m?.cardinals;

  // The four inscriptions run clockwise from the quadrant between S and E. The
  // two letters are joined with a dash here rather than through a message: the
  // letters are translated, the dash between them is the same everywhere.
  const quadrants = [
    [c?.s, c?.e],
    [c?.s, c?.w],
    [c?.n, c?.w],
    [c?.n, c?.e],
  ];

  return (
    <Modal show={show} onHide={close} contentClassName="bg-body-tertiary">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCompass /> {tm?.settings.title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* What the rays say first, then what runs around the rim, then how the
            whole thing is drawn. */}
        <Form.Group controlId="toposcope-line1">
          <Form.Label>{tm?.settings.line1}</Form.Label>

          <Form.Control
            value={settings.line1}
            onChange={(e) =>
              dispatch(toposcopeSet({ line1: e.currentTarget.value }))
            }
          />
        </Form.Group>

        <Form.Group controlId="toposcope-line2" className="mt-3">
          <Form.Label>{tm?.settings.line2}</Form.Label>

          <Form.Control
            value={settings.line2}
            onChange={(e) =>
              dispatch(toposcopeSet({ line2: e.currentTarget.value }))
            }
          />

          <Form.Text muted>{tm?.settings.lineHint}</Form.Text>
        </Form.Group>

        <p className="mt-3 mb-1">{tm?.settings.inscriptions}</p>

        {inscriptions.map((inscription, index) => (
          <Form.Group
            // The four are fixed slots, so their position is their identity.
            key={index}
            controlId={`toposcope-inscription-${index}`}
            className="mb-2"
          >
            <Form.Label className="small mb-1">
              {quadrants[index]![0]}–{quadrants[index]![1]}
            </Form.Label>

            <Form.Control
              value={inscription}
              onChange={(e) =>
                dispatch(
                  toposcopeSetInscription({
                    index,
                    value: e.currentTarget.value,
                  }),
                )
              }
            />
          </Form.Group>
        ))}

        <Form.Text muted>{tm?.settings.placeholders}</Form.Text>

        <Form.Group controlId="toposcope-scale" className="mt-3">
          <Form.Label>
            {tm?.settings.scale}: {settings.scale}&nbsp;%
          </Form.Label>

          <Form.Range
            min={25}
            max={400}
            step={5}
            value={settings.scale}
            onChange={(e) =>
              dispatch(toposcopeSet({ scale: e.currentTarget.valueAsNumber }))
            }
          />

          <Form.Text muted>{tm?.settings.scaleHint}</Form.Text>
        </Form.Group>

        <Form.Group controlId="toposcope-outer-circle" className="mt-3">
          <Form.Label>
            {tm?.settings.outerCircleRadius}: {settings.outerCircleRadius}
          </Form.Label>

          <Form.Range
            min={30}
            max={98}
            step={1}
            value={settings.outerCircleRadius}
            onChange={(e) =>
              dispatch(
                toposcopeSet({
                  outerCircleRadius: e.currentTarget.valueAsNumber,
                }),
              )
            }
          />
        </Form.Group>

        <Form.Group controlId="toposcope-inner-circle" className="mt-3">
          <Form.Label>
            {tm?.settings.innerCircleRadius}: {settings.innerCircleRadius}
          </Form.Label>

          <Form.Range
            min={0}
            max={80}
            step={1}
            value={settings.innerCircleRadius}
            onChange={(e) =>
              dispatch(
                toposcopeSet({
                  innerCircleRadius: e.currentTarget.valueAsNumber,
                }),
              )
            }
          />
        </Form.Group>

        <Form.Check
          className="mt-3"
          id="toposcope-prevent-upturned"
          type="checkbox"
          checked={settings.preventUpturnedText}
          onChange={() =>
            dispatch(
              toposcopeSet({
                preventUpturnedText: !settings.preventUpturnedText,
              }),
            )
          }
          label={tm?.settings.preventUpturnedText}
        />
      </Modal.Body>

      <Modal.Footer>
        <ResetToDefaultsButton
          onClick={() =>
            dispatch(
              toposcopeSet({
                inscriptions: [...toposcopeInitialState.inscriptions],
                innerCircleRadius: toposcopeInitialState.innerCircleRadius,
                outerCircleRadius: toposcopeInitialState.outerCircleRadius,
                scale: toposcopeInitialState.scale,
                preventUpturnedText: toposcopeInitialState.preventUpturnedText,
                line1: toposcopeInitialState.line1,
                line2: toposcopeInitialState.line2,
              }),
            )
          }
        />

        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.close}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
