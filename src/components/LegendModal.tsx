import { ReactElement, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { setActiveModal } from 'fm3/actions/mainActions';

import legend from 'fm3/legend/index.json';
import { Modal } from 'react-bootstrap';

interface LegendItem {
  n: string;
  items: {
    i: string;
    n: string;
  }[];
}

export function LegendModal(): ReactElement {
  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  return (
    <Modal show onHide={close} bsSize="small">
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="map-o" /> Legenda mapy
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Legenda k vrstvám <i>Automapa, Turistická, Cyklomapa a Lyžiarska</i>:
        </p>
        <PanelGroup accordion id="pg1">
          {legend.map((c: LegendItem, i: number) => (
            <Panel key={c.n} eventKey={i}>
              <Panel.Heading>
                <Panel.Title toggle>{c.n}</Panel.Title>
              </Panel.Heading>
              <Panel.Body collapsible>
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
              </Panel.Body>
            </Panel>
          ))}
        </PanelGroup>
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
