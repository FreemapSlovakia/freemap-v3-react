import { FormEvent, ReactElement, useCallback, useState } from 'react';
import { Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { FaCheck, FaCoins, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { purchase, setActiveModal } from '../actions/mainActions.js';
import { useNumberFormat } from '../hooks/useNumberFormat.js';
import { useMessages } from '../l10nInjector.js';
import { isInvalidInt } from '../numberValidator.js';
import { CreditsAlert } from './CredistAlert.js';

type Props = { show: boolean };

export default CurrentDrawingPropertiesModal;

export function CurrentDrawingPropertiesModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const [credits, setCredits] = useState('500');

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    dispatch(purchase({ type: 'credits', amount: Number(credits) }));
  };

  const m = useMessages();

  const nf = useNumberFormat({
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const invalidCredits = isInvalidInt(credits, true, 500);

  return (
    <Modal show={show} onHide={close}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCoins /> {m?.credits.buyCredits}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <CreditsAlert explainCredits />

          <Form.Group controlId="amount">
            <Form.Label className="required">{m?.credits.amount}</Form.Label>

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
                {m?.credits.credits} = {nf.format(Number(credits) / 100)} €
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button type="submit" disabled={invalidCredits}>
            <FaCheck /> {m?.credits.buy}
          </Button>

          <Button variant="dark" type="button" onClick={close}>
            <FaTimes /> {m?.general.cancel}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
