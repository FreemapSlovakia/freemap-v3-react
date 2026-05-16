import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import '@shared/styles/react-tags.scss';
import { Button } from '@mantine/core';
import {
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Dropdown,
  Form,
  InputGroup,
  Modal,
  SplitButton,
  Table,
} from 'react-bootstrap';
import {
  FaCloudDownloadAlt,
  FaEdit,
  FaFilter,
  FaPlus,
  FaRegMap,
  FaSave,
  FaTimes,
  FaTrash,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { ReactTags, Tag } from 'react-tag-autocomplete';
import 'react-tag-autocomplete/example/src/styles.css';
import { assert } from 'typia';
import { mapsDelete, mapsLoad, mapsSave } from '../model/actions.js';

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

  const [formVisible, setFormVisible] = useState(false);

  return (
    <Modal show={show} onHide={close} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaRegMap /> {m?.tools.maps}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {formVisible ? (
          <Form>
            {(isOwnMap || !activeMap) && (
              <Form.Group controlId="mapName" className="mb-3">
                <Form.Label className="required">{m?.general.name}</Form.Label>

                <Form.Control
                  disabled={!online}
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                />
              </Form.Group>
            )}

            {(isOwnMap || !activeMap) && (
              <Form.Group controlId="writers" className="mb-3">
                <Form.Label>{m?.maps.writers}</Form.Label>

                <ReactTags
                  placeholderText={m?.maps.addWriter}
                  newOptionText={m?.general.newOptionText}
                  deleteButtonText={m?.general.deleteButtonText}
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
                  collapseOnSelect
                />
              </Form.Group>
            )}
          </Form>
        ) : (
          <Table responsive hover striped>
            <thead>
              <tr>
                <th>{m?.general.name}</th>

                <th>{m?.general.createdAt}</th>

                <th>{m?.general.modifiedAt}</th>
              </tr>

              <tr>
                <th>
                  <InputGroup className="col-auto">
                    <InputGroup.Text>
                      <FaFilter />
                    </InputGroup.Text>

                    <Form.Control
                      value={filter}
                      onChange={(e) => setFilter(e.currentTarget.value)}
                    />
                  </InputGroup>
                </th>
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
                          ? 'table-primary'
                          : map.id === activeMap?.id
                            ? 'table-success'
                            : undefined
                      }
                      onClick={() =>
                        setSelected((s) => (s === map.id ? undefined : map.id))
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
        )}
      </Modal.Body>

      <Modal.Footer>
        {formVisible ? (
          <>
            {(!activeMap || activeMap?.canWrite) && (
              <Button
                type="button"
                size="sm"
                leftSection={<FaSave />}
                onClick={() => {
                  dispatch(
                    mapsSave({
                      name,
                      writers,
                    }),
                  );

                  setFormVisible(false);
                }}
                disabled={!name || !online}
              >
                {m?.maps.save}
              </Button>
            )}

            <Button
              color="dark"
              size="sm"
              leftSection={<FaTimes />}
              onClick={() => {
                setFormVisible(false);
              }}
            >
              {m?.general.cancel}
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              leftSection={activeMap ? <FaEdit /> : <FaPlus />}
              onClick={() => {
                setFormVisible(true);
              }}
            >
              {activeMap ? m?.general.modify : m?.general.add}
            </Button>

            <SplitButton
              title={
                <>
                  <FaCloudDownloadAlt /> {m?.general.load}
                </>
              }
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
              <Dropdown.ItemText style={{ width: 'max-content' }}>
                <Form.Check
                  id="clear"
                  type="checkbox"
                  checked={clear}
                  onChange={() => setClear((b) => !b)}
                  label={m?.maps.loadToEmpty}
                />
              </Dropdown.ItemText>

              <Dropdown.ItemText>
                <Form.Check
                  id="inclPosition"
                  type="checkbox"
                  checked={inclPosition}
                  onChange={() => setInclPosition((b) => !b)}
                  label={m?.maps.loadInclMapAndPosition}
                />
              </Dropdown.ItemText>
            </SplitButton>

            <Button
              color="red"
              size="sm"
              leftSection={<FaTrash />}
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
              {m?.general.delete}
            </Button>

            <Button
              color="dark"
              size="sm"
              leftSection={<FaTimes />}
              onClick={close}
            >
              {m?.general.close}
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default MapsModal;
