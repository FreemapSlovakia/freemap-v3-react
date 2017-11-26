import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import FormGroup from 'react-bootstrap/lib/FormGroup';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { setActiveModal } from 'fm3/actions/mainActions';

export function SupportUsModal({ onModalClose }) {
  return (
    <Modal show onHide={onModalClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="heart" style={{ color: 'red' }} /> Podporiť freemap <FontAwesomeIcon icon="heart" style={{ color: 'red' }} />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Mapový portál Freemap tvoria ľudia bezodplatne vo svojom voľnom čase.
          Na fungovanie a prevádzku je však potrebný hardware a služby komerčných spoločností.
        </p>
        <hr />
        <p>
          Bankové spojenie: VÚB 2746389453/0200
          <br />
          IBAN: SK33 0200 0000 0027 4638 9453
        </p>
        <p>
          <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
            <input name="cmd" value="_s-xclick" type="hidden" />
            <input name="hosted_button_id" value="DB6Y3ZAB2XCPN" type="hidden" />
            <Button type="submit"><FontAwesomeIcon icon="paypal" /> Prispieť cez Paypal</Button>
          </form>
        </p>
        <p>
          Za kažý príspevok vám budeme veľmi vďačný.
        </p>
        <hr />
        <address>
          Občianske združenie<br />
          <br />
          Freemap Slovakia<br />
          Matičná 8/A5<br />
          900 28 Ivanka pri Dunaji<br />
          <br />
          Registrované na MV/VVS/1-900/90-34343 dňa 2.10.2009<br />
          <br />
          IČO: 42173639<br />
          DIČ: 2022912870<br />
          <br />
          E-mail: <a href="mailto:freemap@freemap.sk">freemap@freemap.sk</a>
        </address>
      </Modal.Body>
      <Modal.Footer>
        <FormGroup>
          <Button onClick={onModalClose}><Glyphicon glyph="remove" /> Zavrieť</Button>
        </FormGroup>
      </Modal.Footer>
    </Modal>
  );
}

SupportUsModal.propTypes = {
  onModalClose: PropTypes.func.isRequired,
};

export default connect(
  null,
  dispatch => ({
    onModalClose() {
      dispatch(setActiveModal(null));
    },
  }),
)(SupportUsModal);
