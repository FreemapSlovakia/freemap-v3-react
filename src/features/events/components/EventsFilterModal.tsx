import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  FmDismissButton,
  FmFooterButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import {
  type ReactElement,
  type SubmitEvent,
  useEffect,
  useState,
} from 'react';
import { Form, InputGroup, Modal } from 'react-bootstrap';
import { FaCheck, FaEraser, FaFilter } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { eventsSetFilter } from '../model/actions.js';

type Props = { show: boolean };

const toDateInput = (d: Date | undefined) =>
  d ? d.toISOString().slice(0, 10) : '';

const fromDateInput = (s: string) => (s ? new Date(s) : undefined);

export default function EventsFilterModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  const filter = useAppSelector((state) => state.events.filter);

  const [from, setFrom] = useState('');

  const [to, setTo] = useState('');

  const [inMapArea, setInMapArea] = useState(false);

  // Seeded from what applies on each open; edits wait for Apply.
  useEffect(() => {
    if (show) {
      setFrom(toDateInput(filter.from));

      setTo(toDateInput(filter.to));

      setInMapArea(Boolean(filter.inMapArea));
    }
  }, [show, filter]);

  useDocumentTitle(show ? 'Events filter' : undefined);

  const close = () => dispatch(setActiveModal(null));

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    dispatch(
      eventsSetFilter({
        ...filter,
        from: fromDateInput(from),
        to: fromDateInput(to),
        inMapArea: inMapArea || undefined,
      }),
    );

    close();
  };

  const filterEmpty = !filter.from && !filter.to && !filter.inMapArea;

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaFilter /> Events filter
        </Modal.Title>
      </Modal.Header>

      <form onSubmit={handleSubmit} className="d-contents">
        <Modal.Body>
          <Form.Group controlId="eventsDate" className="mb-3">
            <Form.Label>Date</Form.Label>

            <InputGroup>
              <Form.Control
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => setFrom(e.currentTarget.value)}
              />

              <InputGroup.Text> - </InputGroup.Text>

              <Form.Control
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => setTo(e.currentTarget.value)}
              />
            </InputGroup>
          </Form.Group>

          <Form.Check
            id="eventsInMapArea"
            checked={inMapArea}
            onChange={(e) => setInMapArea(e.currentTarget.checked)}
            label="Only in the current map area"
          />
        </Modal.Body>

        <FmModalFooter>
          <FmFooterButton
            type="submit"
            icon={<FaCheck />}
            label={m?.general.apply}
          />

          <FmFooterButton
            variant="secondary"
            disabled={filterEmpty}
            icon={<FaEraser />}
            label={m?.general.clear}
            onClick={() => {
              dispatch(eventsSetFilter({}));

              close();
            }}
          />

          <FmDismissButton label={m?.general.cancel} onClick={close} />
        </FmModalFooter>
      </form>
    </Modal>
  );
}
