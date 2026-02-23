import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  type ReactElement,
  SubmitEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

export default ProjectPointModal;

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
  }, [show]);

  const m = useMessages();

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  function isValid() {
    return parseFloat(distance) > 0 && !isNaN(parseFloat(azimuth));
  }

  return (
    <Modal show={show} onHide={onClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{m?.drawing.projection.projectPoint}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group controlId="distance" className="mb-3">
            <Form.Label>{m?.drawing.projection.distance}</Form.Label>

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
            <Form.Label>{m?.drawing.projection.azimuth}</Form.Label>

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

          <Button variant="dark" onClick={close}>
            <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
