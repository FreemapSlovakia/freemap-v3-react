import { setActiveModal } from 'fm3/actions/mainActions';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { FaRegAddressCard, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

type Props = { show: boolean };

export function AboutModal({ show }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  function close() {
    dispatch(setActiveModal(null));
  }

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaRegAddressCard /> {m?.mainMenu.contacts}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h3>{m?.contacts.ngo}</h3>
        <address>
          Freemap Slovakia
          <br />
          Chrenove-Brusno 351
          <br />
          972 32 Chrenovec-Brusno
          <br />
        </address>
        <p>{m?.contacts.registered}</p>
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
          {m?.contacts.bankAccount}: VÚB 2746389453/0200
          <br />
          IBAN: SK33 0200 0000 0027 4638 9453
        </p>
        <p>
          {'E-mail: '}
          <a href="mailto:freemap@freemap.sk">freemap@freemap.sk</a>
        </p>

        <h3>{m?.contacts.generalContact}</h3>
        <ul>
          <li>
            {m?.contacts.board}: <a href="oz@freemap.sk">oz@freemap.sk</a>
          </li>
        </ul>

        <h3>{m?.contacts.boardMemebers}</h3>
        <ul>
          <li>
            {m?.contacts.president}
            {': '}
            <a href="mailto:michal.bellovic@freemap.sk">Michal Bellovič</a>{' '}
            (Prievidza)
          </li>
          <li>
            {m?.contacts.vicepresident}
            {': '}
            <a href="mailto:martin.zdila@freemap.sk">Ing. Martin Ždila</a>{' '}
            (Košice)
          </li>
          <li>
            {m?.contacts.secretary}
            {': '}
            <a href="mailto:tibor.jamecny@freemap.sk">
              Ing. Tibor Jamečný
            </a>{' '}
            (Žilina)
          </li>
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.close}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
