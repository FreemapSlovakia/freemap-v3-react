import { setActiveModal } from '@app/store/actions.js';
import { mapsLoad } from '@features/myMaps/model/actions.js';
import { useConfirm } from '@shared/components/ConfirmProvider.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement } from 'react';
import {
  Badge,
  Button,
  Col,
  Form,
  ListGroup,
  Modal,
  Row,
} from 'react-bootstrap';
import { FaEdit, FaPlus, FaSignInAlt, FaTrash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  type EventItem,
  type EventsFilter,
  eventsDelete,
  eventsSetFilter,
} from '../model/actions.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';

type Props = {
  onCreate: () => void;
  onEdit: (event: EventItem) => void;
};

function toDateInput(d: Date | undefined): string {
  return d ? d.toISOString().slice(0, 10) : '';
}

export function EventsModalList({ onCreate, onEdit }: Props): ReactElement {
  const dispatch = useDispatch();

  const em = useEventsMessages();

  const confirm = useConfirm();

  const list = useAppSelector((state) => state.events.list);

  const filter = useAppSelector((state) => state.events.filter);

  function patchFilter(patch: Partial<EventsFilter>) {
    dispatch(eventsSetFilter({ ...filter, ...patch }));
  }

  return (
    <>
      <Modal.Body>
        <Row className="g-2 mb-3">
          <Col xs={6} md={3}>
            <Form.Label className="mb-0 small">{em?.filterFrom}</Form.Label>

            <Form.Control
              type="date"
              value={toDateInput(filter.from)}
              onChange={(e) =>
                patchFilter({
                  from: e.currentTarget.value
                    ? new Date(e.currentTarget.value)
                    : undefined,
                })
              }
            />
          </Col>

          <Col xs={6} md={3}>
            <Form.Label className="mb-0 small">{em?.filterTo}</Form.Label>

            <Form.Control
              type="date"
              value={toDateInput(filter.to)}
              onChange={(e) =>
                patchFilter({
                  to: e.currentTarget.value
                    ? new Date(e.currentTarget.value)
                    : undefined,
                })
              }
            />
          </Col>

          <Col xs={6} md={3}>
            <Form.Label className="mb-0 small">{em?.activityType}</Form.Label>

            <Form.Select disabled>
              <option>{em?.activityTypePlaceholder}</option>
            </Form.Select>
          </Col>

          <Col xs={6} md={3} className="d-flex align-items-end">
            <Form.Check
              type="checkbox"
              id="events-in-map-area"
              label={em?.inMapArea}
              checked={Boolean(filter.inMapArea)}
              onChange={(e) =>
                patchFilter({ inMapArea: e.currentTarget.checked })
              }
            />
          </Col>
        </Row>

        {list.length === 0 ? (
          <p className="text-muted mb-0">{em?.noEvents}</p>
        ) : (
          <ListGroup>
            {list.map((event) => (
              <ListGroup.Item
                key={event.id}
                className="d-flex align-items-center gap-2"
              >
                <div className="flex-grow-1 min-w-0">
                  <div className="text-truncate">
                    <b>{event.title}</b>{' '}
                    {event.visibility === 'unlisted' && (
                      <Badge bg="secondary">{em?.visibilityUnlisted}</Badge>
                    )}
                  </div>

                  <div className="small text-muted">
                    {event.startAt.toLocaleString()}
                    {event.endAt ? ` – ${event.endAt.toLocaleString()}` : ''}
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  title={em?.open}
                  onClick={() => {
                    dispatch(mapsLoad({ id: event.mapId }));

                    dispatch(setActiveModal(null));
                  }}
                >
                  <FaSignInAlt />
                </Button>

                {event.canWrite && (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      title={em?.edit}
                      onClick={() => onEdit(event)}
                    >
                      <FaEdit />
                    </Button>

                    <Button
                      size="sm"
                      variant="danger"
                      title={em?.delete}
                      onClick={async () => {
                        if (
                          await confirm({
                            message: em?.deleteConfirm(event.title),
                          })
                        ) {
                          dispatch(eventsDelete(event.id));
                        }
                      }}
                    >
                      <FaTrash />
                    </Button>
                  </>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={onCreate}>
          <FaPlus /> {em?.createNew}
        </Button>
      </Modal.Footer>
    </>
  );
}
