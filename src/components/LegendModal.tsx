import React from 'react';
import { connect } from 'react-redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import PanelGroup from 'react-bootstrap/lib/PanelGroup';
import Panel from 'react-bootstrap/lib/Panel';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { setActiveModal } from 'fm3/actions/mainActions';
import { Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';

import legend from 'fm3/legend/index.json';

type Props = ReturnType<typeof mapDispatchToProps>;

interface LegendItem {
  n: string;
  items: Array<{
    i: string;
    n: string;
  }>;
}

const LegendModalInt: React.FC<Props> = ({ onModalClose }) => {
  return (
    <Modal show onHide={onModalClose} bsSize="small">
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="map-o" /> Legenda mapy
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Legenda k vrstvám Automapa, Turistická, Cyklomapa a Lyžiarska.</p>
        <PanelGroup accordion id="pg1">
          {legend.map((c: LegendItem, i: number) => (
            <Panel key={`yyy${c.n}`} eventKey={i}>
              {c.items.map(e => (
                <div key={`xxx${c.n}-${e.n}`}>
                  <div className="legend-item">
                    <img src={require(`fm3/legend/${e.i}`)} alt={e.n} />
                  </div>
                  {` ${e.n}`}
                </div>
              ))}
            </Panel>
          ))}
        </PanelGroup>
      </Modal.Body>
      <Modal.Footer>
        <FormGroup>
          <Button onClick={onModalClose}>
            <Glyphicon glyph="remove" /> Zavrieť
          </Button>
        </FormGroup>
      </Modal.Footer>
    </Modal>
  );
};

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onModalClose() {
    dispatch(setActiveModal(null));
  },
});

export default connect(null, mapDispatchToProps)(LegendModalInt);
