import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import PanelGroup from 'react-bootstrap/lib/PanelGroup';
import Panel from 'react-bootstrap/lib/Panel';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { setActiveModal } from 'fm3/actions/mainActions';

export function Legend({ onModalClose }) {
  return (
    <Modal show onHide={onModalClose} bsSize="small">
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="map-o" /> Legenda mapy
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Legenda k vrstvám Automapa, Turistická, Cyklomapa a Lyžiarska.
        </p>
        <PanelGroup accordion>
          {
            require('fm3/legend/index.json').map((c, i) => (
              <Panel key={`yyy${c.n}`} header={c.n} eventKey={i}>
                {c.items.map(e => (
                  <div key={`xxx${c.n}-${e.n}`}>
                    <div className="legend-item">
                      <img src={require(`fm3/legend/${e.i}`)} alt={e.n} />
                    </div>
                    {` ${e.n}`}
                  </div>
                ))}
              </Panel>
            ))
          }
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
}

Legend.propTypes = {
  onModalClose: PropTypes.func.isRequired,
};

export default connect(
  null,
  dispatch => ({
    onModalClose() {
      dispatch(setActiveModal(null));
    },
  }),
)(Legend);
