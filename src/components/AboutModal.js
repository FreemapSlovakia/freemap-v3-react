import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import FormGroup from 'react-bootstrap/lib/FormGroup';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { setActiveModal } from 'fm3/actions/mainActions';

export function AboutModal({ onModalClose }) {
  return (
    <Modal show onHide={onModalClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="question-circle" /> O freemap
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h3>Občianske združenie</h3>
        <address>
          Freemap Slovakia<br />
          Matičná 8/A5<br />
          900 28 Ivanka pri Dunaji<br />
        </address>
        <p>
          Registrované na MV/VVS/1-900/90-34343 dňa 2.10.2009
        </p>
        <p>
          IČO: <a href="http://www.ives.sk/registre/detailOZ.do?action=aktualny&id=196796" tatget="_blank">42173639</a><br />
          DIČ: 2022912870
        </p>
        <p>
          Bankové spojenie: VÚB 2746389453/0200<br />
          IBAN: SK33 0200 0000 0027 4638 9453
        </p>
        <p>
          E-mail: <a href="mailto:freemap@freemap.sk">freemap@freemap.sk</a>
        </p>

        <h3>Všeobecné kontakty</h3>
        <ul>
          <li>Predstavenstvo: <a href="oz@freemap.sk">oz@freemap.sk</a></li>
        </ul>

        <h3>Členovia predstavenstva</h3>
        <ul>
          <li>Predseda: Michal Bellovič (Prievidza) - <a href="mailto:michal.bellovic@freemap.sk">michal.bellovic@freemap.sk</a></li>
          <li>Podpredseda: Ing. Martin Ždila (Košice) - <a href="mailto:martin.zdila@freemap.sk">martin.zdila@freemap.sk</a></li>
          <li>Tajomník: Mgr. Ing. Michal Páleník, PhD. (Bratislava) - <a href="mailto:michal.palenik@freemap.sk">michal.palenik@freemap.sk</a></li>
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <FormGroup>
          <Button onClick={onModalClose}><Glyphicon glyph="remove" /> Zavrieť</Button>
        </FormGroup>
      </Modal.Footer>
    </Modal>
  );
}

AboutModal.propTypes = {
  onModalClose: PropTypes.func.isRequired,
};

export default connect(
  null,
  dispatch => ({
    onModalClose() {
      dispatch(setActiveModal(null));
    },
  }),
)(AboutModal);
