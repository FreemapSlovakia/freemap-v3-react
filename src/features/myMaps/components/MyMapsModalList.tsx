import { clearMapFeatures, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import { type ReactElement, useCallback, useMemo, useState } from 'react';
import {
  Button,
  Dropdown,
  Form,
  InputGroup,
  ListGroup,
  Modal,
} from 'react-bootstrap';
import {
  FaCloudDownloadAlt,
  FaCog,
  FaEdit,
  FaEllipsisV,
  FaEraser,
  FaFilter,
  FaPlus,
  FaRegCheckSquare,
  FaRegSquare,
  FaSave,
  FaTimes,
  FaTrash,
  FaUnlink,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { fixedPopperConfig } from '@/shared/fixedPopperConfig.js';
import {
  type MapMeta,
  mapsDelete,
  mapsDisconnect,
  mapsLoad,
  mapsSave,
} from '../model/actions.js';

type Props = {
  onAdd: () => void;
  onEdit: (map: MapMeta) => void;
};

export function MyMapsModalList({ onAdd, onEdit }: Props): ReactElement {
  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const { maps, activeMap } = useAppSelector((state) => state.maps);

  const myUserId = useAppSelector((state) => state.auth.user?.id);

  const sortedMaps = useMemo(
    () =>
      [...maps].sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
      ),
    [maps],
  );

  const dateFormat = useDateTimeFormat({
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const [filter, setFilter] = useState('');

  const [clear, setClear] = useState(true);

  const [inclPosition, setInclPosition] = useState(true);

  const m = useMessages();

  const filteredMaps = sortedMaps.filter(
    (map) =>
      !filter || map.name.toLowerCase().includes(filter.toLowerCase().trim()),
  );

  const online = useOnline();

  return (
    <>
      <Modal.Body>
        <div className="d-flex gap-2 mb-3">
          <InputGroup className="flex-grow-1">
            <InputGroup.Text>
              <FaFilter />
            </InputGroup.Text>

            <Form.Control
              value={filter}
              onChange={(e) => setFilter(e.currentTarget.value)}
            />
          </InputGroup>

          <Dropdown align="end" autoClose="outside">
            <Dropdown.Toggle variant="secondary">
              <FaCog />
            </Dropdown.Toggle>

            <Dropdown.Menu popperConfig={fixedPopperConfig}>
              <Dropdown.Header>{m?.general.load}</Dropdown.Header>

              <Dropdown.Item as="button" onClick={() => setClear((b) => !b)}>
                {clear ? <FaRegCheckSquare /> : <FaRegSquare />}{' '}
                {m?.myMaps.loadToEmpty}
              </Dropdown.Item>

              <Dropdown.Item
                as="button"
                onClick={() => setInclPosition((b) => !b)}
              >
                {inclPosition ? <FaRegCheckSquare /> : <FaRegSquare />}{' '}
                {m?.myMaps.loadInclMapAndPosition}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {filteredMaps.length === 0 ? (
          <p className="text-muted mb-0">{m?.myMaps.noMapFound}</p>
        ) : (
          <ListGroup>
            {filteredMaps.map((map) => {
              const isActive = map.id === activeMap?.id;

              const isOwn = map.userId === myUserId;

              return (
                <ListGroup.Item
                  key={map.id}
                  variant={isActive ? 'primary' : undefined}
                  className="d-flex align-items-center gap-2"
                >
                  <div className="flex-grow-1 me-2">
                    <div>{map.name}</div>

                    <small className="text-muted">
                      {m?.general.createdAt}: {dateFormat.format(map.createdAt)}
                      {' · '}
                      {m?.general.modifiedAt}:{' '}
                      {dateFormat.format(map.modifiedAt)}
                    </small>
                  </div>

                  <Dropdown align="end">
                    <Dropdown.Toggle
                      variant="light"
                      size="sm"
                      aria-label={m?.general.actions}
                    >
                      <FaEllipsisV />
                    </Dropdown.Toggle>

                    <Dropdown.Menu popperConfig={fixedPopperConfig}>
                      <Dropdown.Item
                        disabled={!online}
                        onClick={() =>
                          dispatch(
                            mapsLoad({
                              id: map.id,
                              merge: !clear,
                              ignoreLayers: !inclPosition,
                              ignoreMap: !inclPosition,
                            }),
                          )
                        }
                      >
                        <FaCloudDownloadAlt /> {m?.general.load}
                      </Dropdown.Item>

                      {isActive && (
                        <>
                          <Dropdown.Divider />

                          {map.canWrite && (
                            <Dropdown.Item
                              disabled={!online}
                              onClick={() => dispatch(mapsSave(undefined))}
                            >
                              <FaSave /> {m?.myMaps.save}
                            </Dropdown.Item>
                          )}

                          <Dropdown.Item
                            onClick={() => dispatch(mapsDisconnect())}
                          >
                            <FaUnlink /> {m?.myMaps.disconnect}
                          </Dropdown.Item>

                          <Dropdown.Item
                            onClick={() => {
                              dispatch(mapsDisconnect());
                              dispatch(clearMapFeatures());
                            }}
                          >
                            <FaEraser /> {m?.myMaps.disconnectAndClear}
                          </Dropdown.Item>
                        </>
                      )}

                      {isOwn && (
                        <>
                          <Dropdown.Divider />

                          <Dropdown.Item
                            disabled={!online}
                            onClick={() => onEdit(map)}
                          >
                            <FaEdit /> {m?.general.modify}
                          </Dropdown.Item>

                          <Dropdown.Item
                            disabled={!online}
                            className="text-danger"
                            onClick={() => {
                              if (
                                window.confirm(
                                  m?.myMaps.deleteConfirm(map.name),
                                )
                              ) {
                                dispatch(mapsDelete(map.id));
                              }
                            }}
                          >
                            <FaTrash /> {m?.general.delete}
                          </Dropdown.Item>
                        </>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button onClick={onAdd} disabled={!online}>
          <FaPlus /> {m?.myMaps.addNew}
        </Button>

        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.close}
        </Button>
      </Modal.Footer>
    </>
  );
}
