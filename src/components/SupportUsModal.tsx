import React from 'react';
import { connect } from 'react-redux';
import { compose, Dispatch } from 'redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import FormGroup from 'react-bootstrap/lib/FormGroup';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { setActiveModal } from 'fm3/actions/mainActions';
import injectL10n, { Translator } from 'fm3/l10nInjector';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapDispatchToProps> & {
  t: Translator;
};

export const SupportUsModal: React.FC<Props> = ({ onModalClose, t }) => {
  return (
    <Modal show onHide={onModalClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="heart" style={{ color: 'red' }} />{' '}
          {t('more.supportUs')}{' '}
          <FontAwesomeIcon icon="heart" style={{ color: 'red' }} />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{t('supportUs.explanation')}</p>
        <hr />
        <p>
          {t('supportUs.account')} VÚB 2746389453/0200
          <br />
          IBAN: SK33 0200 0000 0027 4638 9453
        </p>
        <form
          action="https://www.paypal.com/cgi-bin/webscr"
          method="post"
          target="_blank"
        >
          <input name="cmd" value="_s-xclick" type="hidden" />
          <input name="hosted_button_id" value="DB6Y3ZAB2XCPN" type="hidden" />
          <Button type="submit">
            <FontAwesomeIcon icon="paypal" /> {t('supportUs.paypal')}
          </Button>
        </form>
        <br />
        <p>{t('supportUs.thanks')}</p>
        <hr />
        <p>2% z dane</p>
        <p>
          Podporiť prevádzku Freemap môžete aj Vašimi 2% z dane. Bližšie
          informácie a tlačivá potrebné k poukázaniu 2% z dane nájdete na{' '}
          <a href="http://wiki.freemap.sk/dvepercenta">
            wiki.freemap.sk/dvepercenta
          </a>
          .
        </p>
        <hr />
        <address>
          Občianske združenie
          <br />
          <br />
          Freemap Slovakia
          <br />
          Chrenovec-Brusno 351
          <br />
          972 32 Chrenovec-Brusno
          <br />
          <br />
          {t('supportUs.registration')}
          <br />
          <br />
          IČO:{' '}
          <a
            href="http://www.ives.sk/registre/detailOZ.do?action=aktualny&id=196796"
            target="_blank"
            rel="noopener noreferrer"
          >
            42173639
          </a>
          <br />
          DIČ: 2022912870
          <br />
          <br />
          E-mail: <a href="mailto:freemap@freemap.sk">freemap@freemap.sk</a>
        </address>
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

export default compose(
  injectL10n(),
  connect(
    null,
    mapDispatchToProps,
  ),
)(SupportUsModal);
