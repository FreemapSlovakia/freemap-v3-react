import { type ReactElement, useCallback } from 'react';
import { Accordion, Button, Card, Modal } from 'react-bootstrap';
import { FaRegMap, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setActiveModal } from '../actions/mainActions.js';
import legend from '../legend/index.json' with { type: 'json' };

interface LegendItem {
  n: string;
  items: {
    i: string;
    n: string;
  }[];
}

type Props = { show: boolean };

export default LegendModal;

export function LegendModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaRegMap /> Legenda mapy
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          Legenda k vrstvám <i>Automapa, Turistická, Cyklomapa a Lyžiarska</i>:
        </p>

        <Accordion>
          {legend.map((c: LegendItem, i: number) => (
            <Accordion.Item key={c.n} eventKey={String(i)}>
              <Accordion.Button as={Card.Header}>{c.n}</Accordion.Button>

              <Accordion.Body>
                {c.items.map((e) => (
                  <div key={e.n} className="legend-item">
                    <div>
                      <div>
                        <img src={require(`../legend/${e.i}`)} alt={e.n} />
                      </div>
                    </div>

                    <div>{e.n}</div>
                  </div>
                ))}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="dark" onClick={close}>
          <FaTimes /> Zavrieť
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
