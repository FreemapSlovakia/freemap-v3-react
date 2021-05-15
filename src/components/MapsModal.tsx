import { setActiveModal } from 'fm3/actions/mainActions';
import { mapsDelete, mapsLoad, mapsSave } from 'fm3/actions/mapsActions';
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import { FaRegMap, FaSave, FaTimes, FaUnlink } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

type Props = { show: boolean };

export function MapsModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const maps = useSelector((state) => state.maps.maps);

  const sortedMaps = useMemo(
    () =>
      [...maps].sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
      ),
    [maps],
  );

  const id = useSelector((state) => state.maps.id);

  const mapName = maps.find((m) => m.id === id)?.name;

  const [name, setName] = useState(mapName ?? '');

  useEffect(() => {
    setName(mapName ?? '');
  }, [mapName]);

  const language = useSelector((state) => state.l10n.language);

  const dateFormat = new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Modal show={show} onHide={close} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaRegMap /> Moje mapy
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <form>
          <FormGroup>
            <FormLabel>Názov</FormLabel>
            <FormControl
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
            />
          </FormGroup>

          <div className="d-flex flex-row flex-wrap align-items-baseline">
            <Button
              type="button"
              className="mb-1"
              onClick={() => dispatch(mapsSave({ name }))}
              disabled={!name}
            >
              <FaSave /> Uložiť
            </Button>

            {id && (
              <Button
                type="button"
                className="ml-1 mb-1"
                onClick={() => dispatch(mapsLoad({ id: undefined }))}
              >
                <FaUnlink /> Odpojiť
              </Button>
            )}
          </div>
        </form>

        <hr />

        <Table striped bordered responsive className="mt-2">
          <thead>
            <tr>
              <th>Názov</th>
              <th>Vytvorené</th>
              <th>Zmenené</th>
              <th>Akcie</th>
            </tr>
          </thead>
          <tbody>
            {sortedMaps.map((map) => (
              <tr
                key={map.id}
                className={id === map.id ? 'table-success' : undefined}
              >
                <td>{map.name}</td>
                <td>{dateFormat.format(map.createdAt)}</td>
                <td>{dateFormat.format(map.modifiedAt)}</td>
                <td>
                  <Button onClick={() => dispatch(mapsLoad({ id: map.id }))}>
                    Načítať na čisto
                  </Button>
                  <Button
                    className="ml-1"
                    onClick={() =>
                      dispatch(mapsLoad({ id: map.id, merge: true }))
                    }
                  >
                    Načítať
                  </Button>
                  <Button
                    className="ml-1"
                    variant="danger"
                    onClick={() => dispatch(mapsDelete(map.id))}
                  >
                    Zmazať
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="dark" onClick={close}>
          <FaTimes /> Zavrieť
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
