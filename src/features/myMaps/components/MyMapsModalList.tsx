import { clearMapFeatures, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useConfirm } from '@shared/components/ConfirmProvider.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import {
  Action,
  ActionDivider,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import { makeLabelComparator } from '@shared/stringUtils.js';
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
  FaCloudDownloadAlt,
  FaCloudUploadAlt,
  FaCog,
  FaCopy,
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
  type BlockedReason,
  canCopy,
  canOverwrite,
  canStandInForMap,
  type MapMeta,
  mapsDelete,
  mapsDisconnect,
  mapsLoad,
  mapsResolveOutbox,
  mapsSave,
  mapsSetAllOffline,
  mapsSyncOutbox,
} from '../model/actions.js';
import { useMyMapsMessages } from '../translations/useMyMapsMessages.js';
import { MapSyncStatus } from './MapSyncStatus.js';

type Props = {
  onAdd: () => void;
  onEdit: (map: MapMeta) => void;
};

export function MyMapsModalList({ onAdd, onEdit }: Props): ReactElement {
  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const { maps, activeMap, offlineIds, outbox } = useAppSelector(
    (state) => state.myMaps,
  );

  const myUserId = useAppSelector((state) => state.auth.user?.id);

  const language = useAppSelector((state) => state.l10n.language);

  const sortedMaps = useMemo(() => {
    const byName = makeLabelComparator(language);

    return [...maps].sort((a, b) =>
      byName(a.name || undefined, b.name || undefined),
    );
  }, [maps, language]);

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

  const confirm = useConfirm();

  const filteredMaps = sortedMaps.filter(
    (map) =>
      !filter || map.name.toLowerCase().includes(filter.toLowerCase().trim()),
  );

  const online = useOnline();

  // The ways out of a refused save. Shared, so the row a map gets when it is no
  // longer listed offers exactly what a listed one does.
  const resolveActions = (
    mapId: string,
    name: string,
    blocked: BlockedReason,
  ) => [
    ...(canCopy(blocked)
      ? [
          <Action
            key="copy"
            icon={<FaCopy />}
            label={mm?.outboxResolveCopy}
            disabled={!online}
            onClick={() =>
              dispatch(mapsResolveOutbox({ mapId, resolution: 'copy' }))
            }
            showFrom="never"
          />,
        ]
      : []),
    ...(canOverwrite(blocked)
      ? [
          <Action
            key="overwrite"
            icon={<FaCloudUploadAlt />}
            label={mm?.outboxResolveOverwrite}
            // Irreversibly drops whatever the map gained meanwhile.
            variant="danger"
            disabled={!online}
            onClick={() =>
              dispatch(mapsResolveOutbox({ mapId, resolution: 'overwrite' }))
            }
            showFrom="never"
          />,
        ]
      : []),
    <Action
      key="discard"
      icon={<FaEraser />}
      label={mm?.outboxResolveDiscard}
      variant="danger"
      // Discarding replaces the local copy with the server's, which has to be
      // read first — unless the map is gone, and there is none to read.
      disabled={!online && blocked !== 'gone'}
      onClick={async () => {
        // The unsent changes exist nowhere else, so this is as final as
        // deleting the map.
        if (
          await confirm({
            title: mm?.outboxDiscardTitle,
            message: mm?.outboxDiscardConfirm(name),
            confirmLabel: mm?.outboxResolveDiscard,
            confirmStyle: 'danger',
          })
        ) {
          dispatch(mapsResolveOutbox({ mapId, resolution: 'discard' }));
        }
      }}
      showFrom="never"
    />,
  ];

  // A refused save whose map is no longer among the listed ones — deleted on the
  // server, or no longer shared. Its row is the only place left to settle it,
  // and without one it would sit in the outbox forever: never replayed, still
  // counted in the logout warning, still keeping the app shell cached.
  const orphans = outbox.filter(
    (entry): entry is typeof entry & { blocked: BlockedReason } =>
      entry.blocked !== undefined &&
      !maps.some((map) => map.id === entry.mapId) &&
      (!filter ||
        entry.name.toLowerCase().includes(filter.toLowerCase().trim())),
  );

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

            <FmDropdownMenu>
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

              <Dropdown.Item
                as="button"
                // A blocked save is waiting for a decision, not for a push, so
                // it doesn't count towards there being anything to send.
                disabled={!outbox.some((entry) => !entry.blocked)}
                onClick={() => dispatch(mapsSyncOutbox({ manual: true }))}
              >
                <FaCloudUploadAlt /> {mm?.syncNow}
              </Dropdown.Item>
            </FmDropdownMenu>
          </Dropdown>
        </div>

        {filteredMaps.length === 0 && orphans.length === 0 ? (
          <p className="text-muted mb-0">{mm?.noMapFound}</p>
        ) : (
          <ListGroup>
            {filteredMaps.map((map) => {
              const isActive = map.id === activeMap?.id;

              const isOwn = map.userId === myUserId;

              const isOffline = offlineIds.includes(map.id);

              const pending = outbox.find((entry) => entry.mapId === map.id);

              const blocked = pending?.blocked;

              return (
                <ListGroup.Item
                  key={map.id}
                  variant={isActive ? 'primary' : undefined}
                  className="d-flex align-items-center gap-2"
                >
                  <div className="flex-grow-1 me-2 min-w-0">
                    <div>
                      {map.name}
                      {isOffline && (
                        <Badge bg="secondary" className="ms-1">
                          <BiWifiOff /> {mm?.offline}
                        </Badge>
                      )}
                      <MapSyncStatus mapId={map.id} className="ms-1" />
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
                      size="sm"
                      align="end"
                      toggleLabel={m?.general.actions}
                    >
                      <Action
                        icon={<FaCloudDownloadAlt />}
                        variant="primary"
                        label={m?.general.load}
                        // A queued save holds the whole document, so it opens
                        // the map offline even without an offline copy — as
                        // long as it is one the read will actually answer with.
                        disabled={
                          !online &&
                          !isOffline &&
                          !(pending && canStandInForMap(pending.blocked))
                        }
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

                      {blocked && <ActionDivider />}

                      {blocked && resolveActions(map.id, map.name, blocked)}

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

            {orphans.map((entry) => (
              <ListGroup.Item
                key={entry.mapId}
                className="d-flex align-items-center gap-2"
              >
                <div className="flex-grow-1 me-2 min-w-0">
                  <div>
                    {entry.name}

                    <MapSyncStatus mapId={entry.mapId} className="ms-1" />
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <ResponsiveActions
                    size="sm"
                    align="end"
                    toggleLabel={m?.general.actions}
                  >
                    {resolveActions(entry.mapId, entry.name, entry.blocked)}
                  </ResponsiveActions>
                </div>
              </ListGroup.Item>
            ))}
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
