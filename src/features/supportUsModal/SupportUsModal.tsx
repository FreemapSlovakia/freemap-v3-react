import { setActiveModal } from '@app/store/actions.js';
import { useLocalMessages, useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useCallback } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { FaGem, FaHeart, FaPaypal, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useBecomePremium } from '../../hooks/useBecomePremium.js';
import { navigate } from '../../navigationUtils.js';
import { documentShow } from '../documents/model/actions.js';
import { SupportUsMessages } from './translations/SupportUsMessages.js';

type Props = { show: boolean };

export function SupportUsModal({ show }: Props): ReactElement {
  const becomePremium = useBecomePremium();

  const language = useAppSelector((state) => state.l10n.language);

  const lm = useLocalMessages<SupportUsMessages>(
    () =>
      import(
        /* webpackExclude: /\.template\./ */
        /* webpackChunkName: "support-translation-[request]" */
        `./translations/${language}.tsx`
      ),
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

        {becomePremium && (
          <Alert variant="warning">
            <span dangerouslySetInnerHTML={{ __html: lm?.alert.line1 ?? '' }} />
            <Button onClick={becomePremium} className="my-3 mx-auto d-block">
              <FaGem /> {m?.premium.becomePremium}
            </Button>
            {lm?.alert.line2}
          </Alert>
        )}

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

            <Form
              action="https://www.paypal.com/cgi-bin/webscr"
              method="post"
              target="_blank"
              className="mb-3"
            >
              <input name="cmd" value="_s-xclick" type="hidden" />

              <input
                name="hosted_button_id"
                value="DB6Y3ZAB2XCPN"
                type="hidden"
              />

              <Button type="submit">
                <FaPaypal /> {lm?.paypal}
              </Button>
            </Form>
          </div>

          <img
            className="ms-2"
            style={{ width: '14em' }}
            src="/pay_by_square.png"
            alt=""
          />
        </div>

        <hr />

        {language === 'sk' && (
          <>
            <p>
              Podporiť prevádzku Freemapu môžete aj Vašimi{' '}
              <a
                href="https://www.freemap.sk/#document=dvePercenta"
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(documentShow('dvePercenta'));
                }}
              >
                2 % z dane
              </a>
              . Následne vás, podľa výpisu z daňového úradu, odmeníme predĺžením
              prémiového prístupu o jeden rok.
            </p>

            <hr />
          </>
        )}

        <p>{lm?.thanks}</p>

        <div className="text-end">
          {lm?.team}{' '}
          <a
            href="#show=about"
            onClick={(e) => {
              e.preventDefault();
              navigate('show=about');
            }}
          >
            OZ Freemap Slovakia
          </a>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SupportUsModal;
