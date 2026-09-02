import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useRoutePlannerMessages } from '@features/routePlanner/translations/useRoutePlannerMessages.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import {
  type TransportType,
  transportTypeDefs,
} from '@shared/transportTypeDefs.js';
import { type ReactElement, type SubmitEvent, useState } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { FaCheck, FaMagic, FaTimes } from 'react-icons/fa';
import { useDispatch, useStore } from 'react-redux';
import { hasPerPointData } from '../matchTrack.js';
import { dataViewerMatchTrack } from '../model/actions.js';
import { resolveActiveTrack } from '../trackSelection.js';
import { useDataViewerMessages } from '../translations/useDataViewerMessages.js';

/** The profiles the matcher can be asked for — GraphHopper's, and only those. */
const matchTransports = (
  Object.keys(transportTypeDefs) as TransportType[]
).filter((transport) => transportTypeDefs[transport].api === 'gh');

type Props = { show: boolean };

export default function DataViewerMatchModal({ show }: Props): ReactElement {
  const m = useMessages();

  const dvm = useDataViewerMessages();

  const rpm = useRoutePlannerMessages();

  const dispatch = useDispatch();

  // Nothing in a GPX says what carried it, so the route planner's transport is
  // the closest thing to a stated intent. Read once — it only seeds the control.
  const store = useStore<RootState>();

  const [transport, setTransport] = useState<TransportType>(() => {
    const last = store.getState().routePlanner.transportType;

    return transportTypeDefs[last].api === 'gh' ? last : 'hiking';
  });

  // The modal has a URL id of its own, so it can be opened with nothing loaded.
  const active = useAppSelector((state) =>
    resolveActiveTrack(
      state.trackViewer.trackGeojson,
      state.trackViewer.activeTrackIndex,
    ),
  );

  // What the matched line cannot carry: it has its own points, and nothing maps
  // the recorded ones onto them.
  const loses = Boolean(active && hasPerPointData(active.feature));

  useDocumentTitle(show ? dvm?.match.title : undefined);

  const close = () => {
    dispatch(setActiveModal(null));
  };

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();

    dispatch(dataViewerMatchTrack({ transport }));

    close();
  };

  return (
    <Modal show={show} onHide={close} contentClassName="bg-body-tertiary">
      <form onSubmit={handleSubmit} className="d-contents">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaMagic /> {dvm?.match.title}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Text muted className="d-block mb-3">
            {dvm?.match.help}
          </Form.Text>

          <Form.Group controlId="matchTransport">
            <Form.Label>{dvm?.match.transport}</Form.Label>

            <Form.Select
              value={transport}
              onChange={(e) => {
                setTransport(e.currentTarget.value as TransportType);
              }}
            >
              {matchTransports.map((value) => (
                <option key={value} value={value}>
                  {rpm?.transportType[transportTypeDefs[value].msgKey]}
                  {/* A native option holds no icon, so the emoji stands in for
                      the flask the route planner marks these with. */}
                  {transportTypeDefs[value].experimental && ' 🧪'}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {loses && (
            <Alert variant="warning" className="mt-3 mb-0">
              {dvm?.match.dataLoss}
            </Alert>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" type="submit" disabled={!active}>
            <FaCheck /> {dvm?.match.run}
          </Button>

          <Button variant="dark" onClick={close}>
            <FaTimes /> {m?.general.cancel} <kbd>Esc</kbd>
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
