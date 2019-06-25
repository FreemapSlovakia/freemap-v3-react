import React from 'react';
import { connect } from 'react-redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import FormGroup from 'react-bootstrap/lib/FormGroup';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { setActiveModal } from 'fm3/actions/mainActions';
import { Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';

interface IProps {
  onModalClose: () => void;
}

export const AboutModal: React.FC<IProps> = ({ onModalClose }) => {
  return (
    <Modal show onHide={onModalClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="address-card-o" /> Kontakty
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h3>Občianske združenie</h3>
        <address>
          Freemap Slovakia
          <br />
          Chrenove-Brusno 351
          <br />
          972 32 Chrenovec-Brusno
          <br />
        </address>
        <p>Registrované na MV/VVS/1-900/90-34343 dňa 2.10.2009</p>
        <p>
          {'IČO: '}
          <a
            href="http://ives.minv.sk/rez/registre/pages/detailoz.aspx?id=196796"
            target="_blank"
            rel="noopener noreferrer"
          >
            42173639
          </a>
          <br />
          DIČ: 2022912870
        </p>
        <p>
          Bankové spojenie: VÚB 2746389453/0200
          <br />
          IBAN: SK33 0200 0000 0027 4638 9453
        </p>
        <p>
          {'E-mail: '}
          <a href="mailto:freemap@freemap.sk">freemap@freemap.sk</a>
        </p>

        <h3>Všeobecné kontakty</h3>
        <ul>
          <li>
            {'Predstavenstvo: '}
            <a href="oz@freemap.sk">oz@freemap.sk</a>
          </li>
        </ul>

        <h3>Členovia predstavenstva</h3>
        <ul>
          <li>
            {'Predseda: Michal Bellovič (Prievidza) - '}
            <a href="mailto:michal.bellovic@freemap.sk">
              michal.bellovic@freemap.sk
            </a>
          </li>
          <li>
            {'Tajomník: Ing. Martin Ždila (Košice) - '}
            <a href="mailto:martin.zdila@freemap.sk">martin.zdila@freemap.sk</a>
          </li>
          <li>
            {'Podpredseda: Mgr. Ing. Michal Páleník, PhD. (Bratislava) - '}
            <a href="mailto:michal.palenik@freemap.sk">
              michal.palenik@freemap.sk
            </a>
          </li>
        </ul>
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

export default connect(
  null,
  (dispatch: Dispatch<RootAction>) => ({
    onModalClose() {
      dispatch(setActiveModal(null));
    },
  }),
)(AboutModal);
