import { setActiveModal } from 'fm3/actions/mainActions';
import { tipsShow } from 'fm3/actions/tipsActions';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { FaHeart, FaPaypal, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

type Props = { show: boolean };

export function SupportUsModal({ show }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaHeart color="red" /> {m?.mainMenu.supportUs}{' '}
          <FaHeart color="red" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{m?.supportUs.explanation}</p>
        <hr />
        <p>
          {m?.supportUs.account} VÚB 2746389453/0200
          <br />
          IBAN: SK33 0200 0000 0027 4638 9453
        </p>
        <div>
          <img
            className="d-block mx-auto w-50 mt-2"
            src="/pay_by_square.png"
            alt=""
          />
        </div>
        <hr />
        <form
          action="https://www.paypal.com/cgi-bin/webscr"
          method="post"
          target="_blank"
        >
          <input name="cmd" value="_s-xclick" type="hidden" />
          <input name="hosted_button_id" value="DB6Y3ZAB2XCPN" type="hidden" />
          <Button className="d-block mx-auto" type="submit">
            <FaPaypal /> {m?.supportUs.paypal}
          </Button>
        </form>
        <hr />
        <p>
          Podporiť prevádzku Freemapu môžete aj Vašimi{' '}
          <a
            href="https://github.com/FreemapSlovakia/freemap-operations/wiki/2%25-z-dan%C3%AD-pre-OZ-Freemap-Slovakia"
            onClick={(e) => {
              e.preventDefault();

              dispatch(tipsShow('dvePercenta'));
            }}
          >
            2% z dane
          </a>
          .
        </p>
        <hr />
        <p>{m?.supportUs.thanks}</p>
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
          {m?.supportUs.registration}
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
        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
