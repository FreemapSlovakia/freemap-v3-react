import React from 'react';
import { connect } from 'react-redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import FormGroup from 'react-bootstrap/lib/FormGroup';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { setActiveModal } from 'fm3/actions/mainActions';
import { Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';
import { withTranslator, Translator } from 'fm3/l10nInjector';

type Props = ReturnType<typeof mapDispatchToProps> & {
  t: Translator;
};

export const AboutModalInt: React.FC<Props> = ({ onModalClose, t }) => {
  return (
    <Modal show onHide={onModalClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="address-card-o" /> {t('more.contacts')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h3>{t('contacts.ngo')}</h3>
        <address>
          Freemap Slovakia
          <br />
          Chrenove-Brusno 351
          <br />
          972 32 Chrenovec-Brusno
          <br />
        </address>
        <p>{t('contacts.registered')}</p>
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
          {t('contacts.bankAccount')}: VÚB 2746389453/0200
          <br />
          IBAN: SK33 0200 0000 0027 4638 9453
        </p>
        <p>
          {'E-mail: '}
          <a href="mailto:freemap@freemap.sk">freemap@freemap.sk</a>
        </p>

        <h3>{t('contacts.generalContact')}</h3>
        <ul>
          <li>
            {t('contacts.board')}: <a href="oz@freemap.sk">oz@freemap.sk</a>
          </li>
        </ul>

        <h3>{t('contacts.boardMemebers')}</h3>
        <ul>
          <li>
            {t('contacts.president')}
            {': '}
            <a href="mailto:michal.bellovic@freemap.sk">Michal Bellovič</a>{' '}
            (Prievidza)
          </li>
          <li>
            {t('contacts.vicepresident')}
            {': '}
            <a href="mailto:michal.palenik@freemap.sk">
              Mgr. Ing. Michal Páleník, PhD.
            </a>{' '}
            (Bratislava)
          </li>
          <li>
            {t('contacts.secretary')}
            {': '}
            <a href="mailto:martin.zdila@freemap.sk">Ing. Martin Ždila</a>{' '}
            (Košice)
          </li>
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <FormGroup>
          <Button onClick={onModalClose}>
            <Glyphicon glyph="remove" /> {t('general.close')}
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

export const AboutModal = connect(
  null,
  mapDispatchToProps,
)(withTranslator(AboutModalInt));
