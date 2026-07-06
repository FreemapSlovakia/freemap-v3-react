import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  type ReactElement,
  type SubmitEvent,
  useEffect,
  useState,
} from 'react';
import { Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import { TbAngle } from 'react-icons/tb';
import { useDrawingMessages } from '../translations/useDrawingMessages.js';

type Props = {
  show: boolean;
  onAdd: (distance: number, azimuth: number) => void;
  onClose: () => void;
};

export function ProjectPointModal({
  show,
  onAdd,
  onClose,
}: Props): ReactElement {
  const [distance, setDistance] = useState('');

  const [azimuth, setAzimuth] = useState('');

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    onAdd(Number(distance), Number(azimuth));
  };

  useEffect(() => {
    setDistance('');

    setAzimuth('');
  }, []);

  const m = useMessages();

  const dm = useDrawingMessages();

  function isValid() {
    return parseFloat(distance) > 0 && !isNaN(parseFloat(azimuth));
  }

  return (
    <Modal
      show={show}
      onHide={onClose}
      contentClassName="bg-body-tertiary"
      scrollable
    >
      <form onSubmit={handleSubmit} className="d-contents">
        <Modal.Header closeButton>
          <Modal.Title>
            <TbAngle /> {dm?.projection.projectPoint}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group controlId="distance" className="mb-3">
            <Form.Label>{dm?.projection.distance}</Form.Label>

            <InputGroup>
              <Form.Control
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.currentTarget.value)}
                min={0}
              />

              <InputGroup.Text>m</InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <Form.Group controlId="azimuth">
            <Form.Label>{dm?.projection.azimuth}</Form.Label>

            <InputGroup>
              <Form.Control
                type="number"
                value={azimuth}
                onChange={(e) => setAzimuth(e.currentTarget.value)}
              />

              <InputGroup.Text>°</InputGroup.Text>
            </InputGroup>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button type="submit" disabled={!isValid()}>
            Add
          </Button>

          <Button variant="dark" onClick={onClose}>
            <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
