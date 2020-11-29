import React, { ReactElement, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import PanelGroup from 'react-bootstrap/lib/PanelGroup';
import Panel from 'react-bootstrap/lib/Panel';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { setActiveModal } from 'fm3/actions/mainActions';

import legend from 'fm3/legend/index.json';

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
            <Glyphicon glyph="remove" /> Zavrieť
          </Button>
        </FormGroup>
      </Modal.Footer>
    </Modal>
  );
}
