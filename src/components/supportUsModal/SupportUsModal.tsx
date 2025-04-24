import { ReactElement, useCallback } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { FaHeart, FaPaypal, FaTimes } from 'react-icons/fa';
import { MdWorkspacePremium } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { documentShow, setActiveModal } from '../../actions/mainActions.js';
import { useAppSelector } from '../../hooks/reduxSelectHook.js';
import { useBecomePremium } from '../../hooks/useBecomePremium.js';
import { useLocalMessages, useMessages } from '../../l10nInjector.js';
import { navigate } from '../../navigationUtils.js';
import { SupportUsMessages } from './translations/SupportUsMessages.js';

type Props = { show: boolean };

export function SupportUsModal({ show }: Props): ReactElement {
  const becomePremium = useBecomePremium();

  const language = useAppSelector((state) => state.l10n.language);

  const lm = useLocalMessages<SupportUsMessages>(
    () => import(`./translations/${language}.tsx`),
  );

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
        {lm?.explanation}

        <hr />

        <div className="d-flex flex-wrap justify-content-between">
          <div>
            <p>
              <b>{lm?.account}</b>
              <br /> VÚB 2746389453/0200
            </p>
            <p>
              <b>IBAN</b>
              <br />
              SK33 0200 0000 0027 4638 9453
            </p>
          </div>

          <img
            className="ms-2"
            style={{ width: '14em' }}
            src="/pay_by_square.png"
            alt=""
          />
        </div>

        <hr />

        {(language === 'sk' || language === 'cs') && (
          <>
            <p>
              Podporiť prevádzku Freemapu môžete aj Vašimi{' '}
              <a
                href="https://github.com/FreemapSlovakia/freemap-operations/wiki/2%25-z-dan%C3%AD-pre-OZ-Freemap-Slovakia"
                onClick={(e) => {
                  e.preventDefault();

                  dispatch(documentShow('dvePercenta'));
                }}
              >
                2% z dane
              </a>
              .
            </p>

            <hr />
          </>
        )}

        <p>{lm?.thanks}</p>

        <p className="text-end">
          <a
            href="#show=about"
            onClick={(e) => {
              e.preventDefault();

              navigate('show=about');
            }}
          >
            OZ Freemap Slovakia
          </a>
        </p>
      </Modal.Body>

      <Modal.Footer>
        {becomePremium && (
          <Button onClick={becomePremium}>
            <MdWorkspacePremium /> {m?.premium.becomePremium}
          </Button>
        )}

        <Form
          action="https://www.paypal.com/cgi-bin/webscr"
          method="post"
          target="_blank"
        >
          <input name="cmd" value="_s-xclick" type="hidden" />

          <input name="hosted_button_id" value="DB6Y3ZAB2XCPN" type="hidden" />

          <Button type="submit">
            <FaPaypal /> {lm?.paypal}
          </Button>
        </Form>

        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SupportUsModal;
