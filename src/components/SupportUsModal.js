import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import FormGroup from 'react-bootstrap/lib/FormGroup';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { setActiveModal } from 'fm3/actions/mainActions';
import injectL10n from 'fm3/l10nInjector';

export function SupportUsModal({ onModalClose, t }) {
  return (
    <Modal show onHide={onModalClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="heart" style={{ color: 'red' }} /> {t('more.supportUs')} <FontAwesomeIcon icon="heart" style={{ color: 'red' }} />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          {t('supportUs.explanation')}
        </p>
        <hr />
        <p>
          {t('supportUs.account')} VÚB 2746389453/0200
          <br />
          IBAN: SK33 0200 0000 0027 4638 9453
        </p>
        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
          <input name="cmd" value="_s-xclick" type="hidden" />
          <input name="hosted_button_id" value="DB6Y3ZAB2XCPN" type="hidden" />
          <Button type="submit">
            <FontAwesomeIcon icon="paypal" /> {t('supportUs.paypal')}
          </Button>
        </form>
        <br />
        <p>
          {t('supportUs.thanks')}
        </p>
        <hr />
        <address>
          Občianske združenie<br />
          <br />
          Freemap Slovakia<br />
          Matičná 8/A5<br />
          900 28 Ivanka pri Dunaji<br />
          <br />
          {t('supportUs.registration')}<br />
          <br />
          IČO: <a href="http://www.ives.sk/registre/detailOZ.do?action=aktualny&id=196796" target="_blank" rel="noopener noreferrer">42173639</a><br />
          DIČ: 2022912870<br />
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
}

SupportUsModal.propTypes = {
  onModalClose: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default compose(
  injectL10n(),
  connect(
    null,
    dispatch => ({
      onModalClose() {
        dispatch(setActiveModal(null));
      },
    }),
  ),
)(SupportUsModal);
