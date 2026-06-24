import { purchase, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { isInvalidInt } from '@shared/numberValidator.js';
import { ReactElement, SubmitEvent, useCallback, useState } from 'react';
import {
  Button,
  ButtonGroup,
  Dropdown,
  Form,
  InputGroup,
  Modal,
} from 'react-bootstrap';
import { FaCheck, FaCoins, FaStopwatch, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useCreditsMessages } from '../translations/useCreditsMessages.js';
import { CreditsAlert } from './CredistAlert.js';

type Props = { show: boolean };

export default function CurrentDrawingPropertiesModal({
  show,
}: Props): ReactElement {
  const dispatch = useDispatch();

  const [credits, setCredits] = useState('500');

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const buyPolar = () => {
    dispatch(purchase({ type: 'credits', amount: Number(credits) }));
  };

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();

    buyPolar();
  };

  const buyWithChrons = () => {
    dispatch(
      purchase({ type: 'credits', amount: Number(credits), via: 'rovas' }),
    );
  };

  const m = useMessages();

  const cm = useCreditsMessages();

  const nf = useNumberFormat({
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const invalidCredits = isInvalidInt(credits, true, 500);

  return (
    <Modal
      show={show}
      onHide={close}
      contentClassName="bg-body-tertiary"
      scrollable
    >
      <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCoins /> {cm?.buyCredits}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <CreditsAlert explainCredits />

          <Form.Group controlId="amount">
            <Form.Label className="required">{cm?.amount}</Form.Label>

            <InputGroup>
              <Form.Control
                type="number"
                value={credits}
                min={500}
                step={10}
                isInvalid={invalidCredits}
                onChange={(e) => setCredits(e.currentTarget.value)}
              />

              <InputGroup.Text>
                {cm?.credits} = {nf.format(Number(credits) / 100)} €
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <hr className="mt-4" />

          <p className="mt-3 mb-0 text-body-secondary">{cm?.chronsHint}</p>
        </Modal.Body>

        <Modal.Footer>
          <Dropdown as={ButtonGroup}>
            <Button
              variant="primary"
              disabled={invalidCredits}
              onClick={buyPolar}
            >
              <FaCheck /> {cm?.buy}
            </Button>

            <Dropdown.Toggle
              split
              variant="primary"
              id="credits-buy"
              disabled={invalidCredits}
            />

            <Dropdown.Menu renderOnMount popperConfig={{ strategy: 'fixed' }}>
              <Dropdown.Item
                className="text-nowrap"
                disabled={invalidCredits}
                onClick={buyWithChrons}
              >
                <FaStopwatch /> {cm?.payWithChrons}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Button variant="dark" onClick={close}>
            <FaTimes /> {m?.general.cancel}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
