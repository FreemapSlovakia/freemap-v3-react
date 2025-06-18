import { FormEvent, ReactElement, useCallback, useState } from 'react';
import { Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { FaCheck, FaCoins, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { purchase, setActiveModal } from '../actions/mainActions.js';
import { useNumberFormat } from '../hooks/useNumberFormat.js';
import { useMessages } from '../l10nInjector.js';
import { CreditsAlert } from './CredistAlert.js';

type Props = { show: boolean };

export default CurrentDrawingPropertiesModal;

export function CurrentDrawingPropertiesModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const [credits, setCredits] = useState('100');

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

  return (
    <Modal show={show} onHide={close}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCoins /> Buy credits
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <CreditsAlert buy={false} />

          <Form.Group>
            <Form.Label>Credits</Form.Label>

            <InputGroup>
              <Form.Control
                type="number"
                value={credits}
                min={1}
                step={1}
                onChange={(e) => setCredits(e.currentTarget.value)}
              />

              <InputGroup.Text>
                credits = {nf.format(Number(credits) / 100)} €
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button type="submit" disabled={!/^[1-9]\d*$/.test(credits)}>
            <FaCheck /> Buy
          </Button>

          <Button variant="dark" type="button" onClick={close}>
            <FaTimes /> {m?.general.cancel}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
