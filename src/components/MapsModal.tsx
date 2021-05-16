import { setActiveModal } from 'fm3/actions/mainActions';
import { mapsDelete, mapsLoad, mapsSave } from 'fm3/actions/mapsActions';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import FormCheck from 'react-bootstrap/FormCheck';
import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import {
  FaCloudDownloadAlt,
  FaFilter,
  FaRegMap,
  FaSave,
  FaTimes,
  FaTrash,
  FaUnlink,
} from 'react-icons/fa';
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

  const [filter, setFilter] = useState('');

  const [selected, setSelected] = useState<string>();

  const [clear, setClear] = useState(true);

  const [inclPosition, setInclPosition] = useState(true);

  const selectedMap = selected
    ? maps.find((map) => map.id === selected)
    : undefined;

  const m = useMessages();

  const filteredMaps = sortedMaps.filter(
    (map) =>
      !filter || map.name.toLowerCase().includes(filter.toLowerCase().trim()),
  );

  return (
    <Modal show={show} onHide={close} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaRegMap /> {m?.tools.maps}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="bg-light">
        <Card className="mb-2">
          <Card.Body>
            <Card.Title>
              {!mapName ? (
                m?.maps.newMap
              ) : m ? (
                <m.maps.SomeMap name={mapName} />
              ) : (
                mapName
              )}
            </Card.Title>
            <form>
              <FormGroup>
                <FormLabel>{m?.general.name}</FormLabel>
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
                  <FaSave /> {m?.maps.save}
                </Button>

                {id && (
                  <Button
                    type="button"
                    className="ml-1 mb-1"
                    onClick={() => dispatch(mapsLoad({ id: undefined }))}
                  >
                    <FaUnlink /> {m?.maps.disconnect}
                  </Button>
                )}
              </div>
            </form>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <Card.Title>{m?.maps.savedMaps}</Card.Title>

            <div
              className="overflow-auto"
              style={{ maxHeight: '50vh', minHeight: '8rem' }}
            >
              <Table bordered responsive hover className="mt-2">
                <thead>
                  <tr>
                    <th>
                      <div className="form-row mb-2">
                        <InputGroup className="col-auto">
                          <InputGroup.Prepend>
                            <InputGroup.Text>
                              <FaFilter />
                            </InputGroup.Text>
                          </InputGroup.Prepend>
                          <FormControl
                            value={filter}
                            onChange={(e) => setFilter(e.currentTarget.value)}
                          />
                        </InputGroup>
                      </div>
                      {m?.general.name}
                    </th>
                    <th>{m?.general.createdAt}</th>
                    <th>{m?.general.modifiedAt}</th>
                  </tr>
                </thead>
                <tbody>
                  {!filteredMaps
                    ? m?.maps.noMapFound
                    : filteredMaps.map((map) => (
                        <tr
                          role="button"
                          key={map.id}
                          className={
                            map === selectedMap
                              ? 'table-active'
                              : map.id === id
                              ? 'table-success'
                              : undefined
                          }
                          onClick={() =>
                            setSelected((s) =>
                              s === map.id ? undefined : map.id,
                            )
                          }
                        >
                          <td>{map.name}</td>
                          <td>{dateFormat.format(map.createdAt)}</td>
                          <td>{dateFormat.format(map.modifiedAt)}</td>
                        </tr>
                      ))}
                </tbody>
              </Table>
            </div>

            <FormCheck
              id="clear"
              type="checkbox"
              checked={clear}
              onChange={() => setClear((b) => !b)}
              label={m?.maps.loadToEmpty}
            />

            <FormCheck
              id="inclPosition"
              type="checkbox"
              checked={inclPosition}
              onChange={() => setInclPosition((b) => !b)}
              label={m?.maps.loadInclMapAndPosition}
            />

            <div className="mt-2">
              <Button
                disabled={!selectedMap}
                onClick={() =>
                  selectedMap &&
                  dispatch(
                    mapsLoad({
                      id: selectedMap.id,
                      merge: !clear,
                      ignoreLayers: !inclPosition,
                      ignoreMap: !inclPosition,
                    }),
                  )
                }
              >
                <FaCloudDownloadAlt /> {m?.general.load}
              </Button>

              <Button
                className="ml-1"
                variant="danger"
                disabled={!selectedMap && !id}
                onClick={() => {
                  if (
                    window.confirm(
                      m?.maps.deleteConfirm(
                        selectedMap ? selectedMap.name : mapName ?? '???',
                      ),
                    )
                  ) {
                    dispatch(mapsDelete(selectedMap?.id));
                  }
                }}
              >
                <FaTrash /> {m?.general.delete}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.close}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
