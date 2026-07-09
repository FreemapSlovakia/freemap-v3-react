import { clearMapFeatures, setActiveModal } from '@app/store/actions.js';
import { useEventsMessages } from '@features/events/translations/useEventsMessages.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useConfirm } from '@shared/components/ConfirmProvider.js';
import {
  Action,
  ActionDivider,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
import { fixedPopperConfig } from '@shared/fixedPopperConfig.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import { type ReactElement, useCallback, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Dropdown,
  Form,
  InputGroup,
  ListGroup,
  Modal,
} from 'react-bootstrap';
import { BiWifiOff } from 'react-icons/bi';
import {
  FaCalendarAlt,
  FaCloudDownloadAlt,
  FaCog,
  FaEdit,
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
import {
  type MapMeta,
  mapsDelete,
  mapsDisconnect,
  mapsLoad,
  mapsSave,
  mapsSetAllOffline,
} from '../model/actions.js';
import { useMyMapsMessages } from '../translations/useMyMapsMessages.js';

type Props = {
  onAdd: () => void;
  onEdit: (map: MapMeta) => void;
};

export function MyMapsModalList({ onAdd, onEdit }: Props): ReactElement {
  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const { maps, activeMap, offlineIds } = useAppSelector(
    (state) => state.myMaps,
  );

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

  const mm = useMyMapsMessages();

  const em = useEventsMessages();

  const confirm = useConfirm();

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
                {mm?.loadToEmpty}
              </Dropdown.Item>

              <Dropdown.Item
                as="button"
                onClick={() => setInclPosition((b) => !b)}
              >
                {inclPosition ? <FaRegCheckSquare /> : <FaRegSquare />}{' '}
                {mm?.loadInclMapAndPosition}
              </Dropdown.Item>

              <Dropdown.Divider />

              <Dropdown.Header>{mm?.offline}</Dropdown.Header>

              <Dropdown.Item
                as="button"
                disabled={!online || maps.length === 0}
                onClick={() => dispatch(mapsSetAllOffline(true))}
              >
                <BiWifiOff /> {mm?.makeAllOffline}
              </Dropdown.Item>

              <Dropdown.Item
                as="button"
                disabled={offlineIds.length === 0}
                onClick={() => dispatch(mapsSetAllOffline(false))}
              >
                <FaTimes /> {mm?.removeAllOffline}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {filteredMaps.length === 0 ? (
          <p className="text-muted mb-0">{mm?.noMapFound}</p>
        ) : (
          <ListGroup>
            {filteredMaps.map((map) => {
              const isActive = map.id === activeMap?.id;

              const isOwn = map.userId === myUserId;

              const isOffline = offlineIds.includes(map.id);

              return (
                <ListGroup.Item
                  key={map.id}
                  variant={isActive ? 'primary' : undefined}
                  className="d-flex align-items-center gap-2"
                >
                  <div className="flex-grow-1 me-2 min-w-0">
                    <div>
                      {map.name}{' '}
                      {isOffline && (
                        <Badge bg="secondary">
                          <BiWifiOff /> {mm?.offline}
                        </Badge>
                      )}
                    </div>

                    <small className="text-muted">
                      <span className="text-nowrap">
                        {m?.general.createdAt}:{' '}
                        <strong>{dateFormat.format(map.createdAt)}</strong>
                      </span>
                      {' · '}
                      <span className="text-nowrap">
                        {m?.general.modifiedAt}:{' '}
                        <strong>{dateFormat.format(map.modifiedAt)}</strong>
                      </span>
                    </small>
                  </div>

                  <div className="flex-shrink-0">
                    <ResponsiveActions
                      align="end"
                      toggleLabel={m?.general.actions}
                    >
                      <Action
                        icon={<FaCloudDownloadAlt />}
                        variant="primary"
                        label={m?.general.load}
                        disabled={!online && !isOffline}
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
                        showFrom="sm"
                      />

                      {isActive && <ActionDivider />}

                      {isActive && map.canWrite && (
                        <Action
                          icon={<FaSave />}
                          label={mm?.save}
                          disabled={!online}
                          onClick={() => dispatch(mapsSave(undefined))}
                          showFrom="never"
                        />
                      )}

                      {isActive && (
                        <Action
                          icon={<FaUnlink />}
                          label={mm?.disconnect}
                          onClick={() => dispatch(mapsDisconnect())}
                          showFrom="never"
                        />
                      )}

                      {isActive && (
                        <Action
                          icon={<FaEraser />}
                          label={mm?.disconnectAndClear}
                          onClick={() => {
                            dispatch(mapsDisconnect());
                            dispatch(clearMapFeatures());
                          }}
                          showFrom="never"
                        />
                      )}

                      {isOwn && <ActionDivider />}

                      {isOwn && (
                        <Action
                          icon={<FaEdit />}
                          label={m?.general.modify}
                          disabled={!online}
                          onClick={() => onEdit(map)}
                          showFrom="lg"
                        />
                      )}

                      {isOwn && (
                        <Action
                          icon={<FaCalendarAlt />}
                          label={em?.publishAsEvent}
                          disabled={!online}
                          onClick={() =>
                            dispatch(
                              setActiveModal({
                                type: 'events',
                                create: { mapId: map.id },
                              }),
                            )
                          }
                          showFrom="lg"
                        />
                      )}

                      {isOwn && (
                        <Action
                          icon={<FaTrash />}
                          label={m?.general.delete}
                          variant="danger"
                          disabled={!online}
                          onClick={async () => {
                            if (
                              await confirm({
                                title: mm?.deleteTitle,
                                message: mm?.deleteConfirm(map.name),
                                confirmLabel: m?.general.delete,
                                confirmStyle: 'danger',
                              })
                            ) {
                              dispatch(mapsDelete(map.id));
                            }
                          }}
                          showFrom="lg"
                        />
                      )}
                    </ResponsiveActions>
                  </div>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button onClick={onAdd} disabled={!online}>
          <FaPlus /> {mm?.addNew}
        </Button>

        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.close}
        </Button>
      </Modal.Footer>
    </>
  );
}
