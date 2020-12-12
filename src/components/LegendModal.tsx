import { ReactElement, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { setActiveModal } from 'fm3/actions/mainActions';

import legend from 'fm3/legend/index.json';
import { Accordion, Button, Card, FormGroup, Modal } from 'react-bootstrap';

interface LegendItem {
  n: string;
  items: {
    i: string;
    n: string;
  }[];
}

type Props = { show: boolean };

export function LegendModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  return (
    <Modal show={show} onHide={close} size="sm">
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="map-o" /> Legenda mapy
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Legenda k vrstvám <i>Automapa, Turistická, Cyklomapa a Lyžiarska</i>:
        </p>
        <Accordion>
          {legend.map((c: LegendItem, i: number) => (
            <Card key={c.n}>
              <Card.Header>
                <Accordion.Toggle
                  as={Button}
                  variant="link"
                  eventKey={String(i)}
                >
                  {c.n}
                </Accordion.Toggle>
              </Card.Header>
              <Accordion.Collapse eventKey={String(i)}>
                <Card.Body>
                  {c.items.map((e) => (
                    <div key={e.n} className="legend-item">
                      <div>
                        <div>
                          <img src={require(`fm3/legend/${e.i}`)} alt={e.n} />
                        </div>
                      </div>
                      <div>{e.n}</div>
                    </div>
                  ))}
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          ))}
        </Accordion>
      </Modal.Body>
      <Modal.Footer>
        <FormGroup>
          <Button onClick={close}>
            <FontAwesomeIcon icon="close" /> Zavrieť
          </Button>
        </FormGroup>
      </Modal.Footer>
    </Modal>
  );
}
