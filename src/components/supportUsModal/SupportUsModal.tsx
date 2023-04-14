import { documentShow, setActiveModal } from 'fm3/actions/mainActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useLocalMessages, useMessages } from 'fm3/l10nInjector';
import { navigate } from 'fm3/navigationUtils';
import { ReactElement, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { FaHeart, FaPaypal, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { SupportUsMessages } from './translations/SupportUsMessages';

type Props = { show: boolean };

export function SupportUsModal({ show }: Props): ReactElement {
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
        <p>{lm?.explanation}</p>
        <hr />
        <p>
          {lm?.account} VÚB 2746389453/0200
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
            <FaPaypal /> {lm?.paypal}
          </Button>
        </form>
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
        <p>
          <a
            href="?show=about"
            onClick={(e) => {
              e.preventDefault();

              navigate(new URLSearchParams('show=about'));
            }}
          >
            OZ Freemap Slovakia
          </a>
        </p>
      </Modal.Body>

      <Modal.Footer>
        {(language === 'sk' || language === 'cs') && (
          <Button variant="link" href="https://oz.freemap.sk/">
            Ako sa stať členom?
          </Button>
        )}

        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SupportUsModal;
