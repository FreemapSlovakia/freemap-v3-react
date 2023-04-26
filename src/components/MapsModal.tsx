import { setActiveModal } from 'fm3/actions/mainActions';
import {
  mapsDelete,
  mapsDisconnect,
  mapsLoad,
  mapsSave,
} from 'fm3/actions/mapsActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useDateTimeFormat } from 'fm3/hooks/useDateTimeFormat';
import { useOnline } from 'fm3/hooks/useOnline';
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
import { useDispatch } from 'react-redux';
import { ReactTags, Tag } from 'react-tag-autocomplete';
import 'react-tag-autocomplete/example/src/styles.css';
import { assert } from 'typia';

type Props = { show: boolean };

type User = {
  id: number;
  name: string;
};

export function MapsModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const { maps, activeMap } = useAppSelector((state) => state.maps);

  const sortedMaps = useMemo(
    () =>
      [...maps].sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
      ),
    [maps],
  );

  const myUserId = useAppSelector((state) => state.auth.user?.id);

  const isOwnMap = activeMap?.userId === myUserId;

  const mapName = activeMap?.name ?? '';

  useEffect(() => {
    setName(mapName);
  }, [mapName]);

  const [name, setName] = useState(mapName);

  const [writers, setWriters] = useState<number[]>([]);

  useEffect(() => {
    setWriters(activeMap?.writers ?? []);
  }, [activeMap]);

  const dateFormat = useDateTimeFormat({
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

  const online = useOnline();

  const [users, setUsers] = useState<User[]>();

  useEffect(() => {
    fetch(`${process.env['API_URL']}/users`)
      .then((res) => {
        if (res.ok) {
          return res.json();
        }

        throw new Error();
      })
      .then((data) => {
        setUsers(assert<User[]>(data));
      })
      .catch((err) => {
        dispatch(
          toastsAdd({
            style: 'danger',
            messageKey: 'general.loadError',
            messageParams: { err },
          }),
        );
      });
  }, [dispatch]);

  const userMap = useMemo(() => {
    const userMap = new Map<number, string>();

    for (const user of users ?? []) {
      userMap.set(user.id, user.name);
    }

    return userMap;
  }, [users]);

  const handleWriterAddition = (tag: Tag) => {
    setWriters((writers) => writers && [...writers, Number(tag.value)]);
  };

  const handleWriterDelete = (index: number) => {
    setWriters((writers) => writers?.filter((_, i) => i !== index));
  };

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
              {activeMap ? (
                m ? (
                  <m.maps.SomeMap name={activeMap.name} />
                ) : (
                  activeMap.name
                )
              ) : (
                m?.maps.newMap
              )}
            </Card.Title>

            <form>
              {(isOwnMap || !activeMap) && (
                <FormGroup>
                  <FormLabel>{m?.general.name}</FormLabel>

                  <FormControl
                    disabled={!online}
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
                  />
                </FormGroup>
              )}

              {(isOwnMap || !activeMap) && (
                <FormGroup>
                  <FormLabel>{m?.maps.writers}</FormLabel>

                  <ReactTags
                    selected={writers?.map((id) => ({
                      value: id,
                      label: userMap.get(id) ?? '???',
                    }))}
                    suggestions={
                      users
                        ?.filter(
                          (user) =>
                            user.id !== myUserId && !writers?.includes(user.id),
                        )
                        .map((user) => ({
                          label: user.name,
                          value: user.id,
                        })) ?? []
                    }
                    onAdd={handleWriterAddition}
                    onDelete={handleWriterDelete}
                  />
                </FormGroup>
              )}

              <div className="d-flex flex-row flex-wrap align-items-baseline">
                {(!activeMap || activeMap?.canWrite) && (
                  <Button
                    type="button"
                    className="mb-1 mr-1"
                    onClick={() =>
                      dispatch(
                        mapsSave({
                          name,
                          writers,
                        }),
                      )
                    }
                    disabled={!name || !online}
                  >
                    <FaSave /> {m?.maps.save}
                  </Button>
                )}

                {activeMap && (
                  <Button
                    type="button"
                    className="mb-1"
                    onClick={() => dispatch(mapsDisconnect())}
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
                  {filteredMaps
                    ? filteredMaps.map((map) => (
                        <tr
                          role="button"
                          key={map.id}
                          className={
                            map === selectedMap
                              ? 'table-active'
                              : map.id === activeMap?.id
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
                      ))
                    : m?.maps.noMapFound}
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
                disabled={
                  !myUserId ||
                  (selectedMap ?? activeMap)?.userId !== myUserId ||
                  !online
                }
                onClick={() => {
                  const map = selectedMap ?? activeMap;

                  if (map && window.confirm(m?.maps.deleteConfirm(map.name))) {
                    dispatch(mapsDelete(map.id));
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

export default MapsModal;
