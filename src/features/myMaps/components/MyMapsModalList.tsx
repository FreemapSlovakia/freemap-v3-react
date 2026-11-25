import { clearMapFeatures, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { Text } from '@features/l10n/Text.js';
import { Checkbox } from '@shared/components/Checkbox.js';
import { FitToggleButtonGroup } from '@shared/components/FitButtonGroup.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import {
  FmDismissButton,
  FmFooterButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { MenuLabel } from '@shared/components/MenuLabel.js';
import { Modal } from '@shared/components/Modal.js';
import { useConfirm } from '@shared/components/ModalProvider.js';
import { OfflineBadge } from '@shared/components/OfflineBadge.js';
import { OnlineOnlyItem } from '@shared/components/OnlineOnlyItem.js';
import { Radio } from '@shared/components/Radio.js';
import {
  Action,
  ActionDivider,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
import { UserChip } from '@shared/components/UserChip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import { makeLabelComparator } from '@shared/stringUtils.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { type ReactElement, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Dropdown,
  Form,
  InputGroup,
  ListGroup,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import { BiWifiOff } from 'react-icons/bi';
import {
  FaCalendarDay,
  FaCloudDownloadAlt,
  FaCloudUploadAlt,
  FaCog,
  FaCopy,
  FaEdit,
  FaEraser,
  FaEyeSlash,
  FaFilter,
  FaPlus,
  FaSave,
  FaShapes,
  FaTimes,
  FaTrash,
  FaUnlink,
  FaUserFriends,
  FaUserMinus,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useAskLoadMerge } from '../hooks/useAskLoadMerge.js';
import {
  type BlockedReason,
  canCopy,
  canOverwrite,
  canStandInForMap,
  type MapListItem,
  type MyMapsOwnerFilter,
  mapsDelete,
  mapsDisconnect,
  mapsLeave,
  mapsLoad,
  mapsResolveOutbox,
  mapsSave,
  mapsSetAllOffline,
  mapsSetOwnerFilter,
  mapsSetSort,
  mapsSyncOutbox,
  mapsToggleHiddenTag,
} from '../model/actions.js';
import { myMapsTagsSelector } from '../model/selectors.js';
import { useMyMapsMessages } from '../translations/useMyMapsMessages.js';
import { MapSyncStatus } from './MapSyncStatus.js';

/** Stands for the untagged maps among picked tags; no tag is empty. */
const UNTAGGED = '';

/** Tags picked to list only their maps. */
export type TagPick = { tags: string[]; mode: 'any' | 'all' };

type Props = {
  tagPick: TagPick;
  onTagPickChange: (pick: TagPick) => void;
  onAdd: () => void;
  onEdit: (map: MapListItem) => void;
};

export function MyMapsModalList({
  tagPick,
  onTagPickChange,
  onAdd,
  onEdit,
}: Props): ReactElement {
  const dispatch = useDispatch();

  const close = () => {
    dispatch(setActiveModal(null));
  };

  const { maps, activeMap, offlineIds, outbox } = useAppSelector(
    (state) => state.myMaps,
  );

  const myUserId = useAppSelector((state) => state.auth.user?.id);

  const language = useAppSelector((state) => state.l10n.language);

  const { sort, ownerFilter, hiddenTags } = useAppSelector(
    (state) => state.myMapsSettings,
  );

  const sortedMaps = useMemo(() => {
    const byName = makeLabelComparator(language);

    return maps.toSorted((a, b) =>
      sort === 'name'
        ? byName(a.name || undefined, b.name || undefined)
        : b[sort].getTime() - a[sort].getTime(),
    );
  }, [maps, language, sort]);

  const allTags = useAppSelector(myMapsTagsSelector);

  // Only the owner gets `writers`.
  const isSharedByMe = (map: MapListItem) => Boolean(map.writers?.length);

  const hasShared = maps.some(
    (map) => map.userId !== myUserId || isSharedByMe(map),
  );

  const shownTags = allTags.filter((tag) => !hiddenTags.includes(tag));

  // A pick of a tag since hidden or gone counts for nothing.
  const picked = tagPick.tags.filter((tag) =>
    // Without a tag button row, nothing would show Untagged is pressed.
    tag === UNTAGGED ? shownTags.length > 0 : shownTags.includes(tag),
  );

  const pickedTags = picked.filter(Boolean);

  // No map can be untagged and hold every picked tag.
  const allMode = tagPick.mode === 'all' && pickedTags.length > 1;

  const untaggedPicked = !allMode && picked.includes(UNTAGGED);

  const togglePick = (tag: string) => {
    if (!picked.includes(tag)) {
      trackMatomo(['trackEvent', 'MyMaps', 'pickTag']);
    }

    onTagPickChange({
      ...tagPick,
      tags: picked.includes(tag)
        ? picked.filter((t) => t !== tag)
        : [...picked, tag],
    });
  };

  const isHidden = (map: MapListItem) =>
    map.tags.some((tag) => hiddenTags.includes(tag));

  const isPicked = (map: MapListItem) =>
    picked.length === 0 ||
    (untaggedPicked && map.tags.length === 0) ||
    (allMode
      ? pickedTags.every((tag) => map.tags.includes(tag))
      : pickedTags.some((tag) => map.tags.includes(tag)));

  const dateFormat = useDateTimeFormat({
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const [filter, setFilter] = useState('');

  const [menuShown, setMenuShown] = useState(false);

  const m = useMessages();

  const mm = useMyMapsMessages();

  const confirm = useConfirm();

  const askLoadMerge = useAskLoadMerge();

  const handleLoad = async (id: string, inclPosition: boolean) => {
    const merge = await askLoadMerge();

    if (merge === null) {
      return;
    }

    dispatch(
      mapsLoad({
        id,
        merge,
        ignoreLayers: !inclPosition,
        ignoreMap: !inclPosition,
      }),
    );
  };

  const matchesOwner = (map: MapListItem) => {
    switch (ownerFilter) {
      case 'all':
        return true;
      case 'own':
        return map.userId === myUserId;
      case 'shared':
        return map.userId !== myUserId;
      case 'sharedByMe':
        return isSharedByMe(map);
    }
  };

  const matchesFilter = (map: MapListItem) =>
    (!filter || map.name.toLowerCase().includes(filter.toLowerCase().trim())) &&
    matchesOwner(map);

  const filteredMaps = sortedMaps.filter(
    (map) => matchesFilter(map) && !isHidden(map) && isPicked(map),
  );

  const hiddenCount = maps.filter(
    (map) => matchesFilter(map) && isHidden(map),
  ).length;

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
            requiresOnline
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
            requiresOnline
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
      requiresOnline={blocked !== 'gone'}
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

          {/* Open while ticking sort and hidden tags; the actions close it. */}
          <Dropdown
            align="end"
            autoClose="outside"
            show={menuShown}
            onToggle={setMenuShown}
          >
            <Dropdown.Toggle variant="secondary">
              <FaCog />
            </Dropdown.Toggle>

            <FmDropdownMenu>
              <Dropdown.Header>
                <Text m={mm} k="sort" />
              </Dropdown.Header>

              {(
                [
                  ['name', mm?.sortName],
                  ['createdAt', mm?.sortCreated],
                  ['modifiedAt', mm?.sortModified],
                ] as const
              ).map(([value, label]) => (
                <Dropdown.Item
                  key={value}
                  as="button"
                  active={sort === value}
                  onClick={() => {
                    trackMatomo(['trackEvent', 'MyMaps', 'sort', value]);

                    dispatch(mapsSetSort(value));
                  }}
                >
                  <Radio value={sort === value} />
                  <MenuLabel>{label}</MenuLabel>
                </Dropdown.Item>
              ))}

              <Dropdown.Divider />

              {allTags.length > 0 && (
                <>
                  <Dropdown.Header>
                    <Text m={mm} k="hiddenTags" />
                  </Dropdown.Header>

                  {allTags.map((tag) => (
                    <Dropdown.Item
                      key={tag}
                      as="button"
                      active={hiddenTags.includes(tag)}
                      onClick={() => {
                        if (!hiddenTags.includes(tag)) {
                          trackMatomo(['trackEvent', 'MyMaps', 'hideTag']);
                        }

                        dispatch(mapsToggleHiddenTag(tag));
                      }}
                    >
                      <Checkbox value={hiddenTags.includes(tag)} />
                      <MenuLabel>{tag}</MenuLabel>
                    </Dropdown.Item>
                  ))}

                  <Dropdown.Divider />
                </>
              )}

              <Dropdown.Header>
                <Text m={mm} k="offline" />
              </Dropdown.Header>

              <OnlineOnlyItem
                as="button"
                disabled={maps.length === 0}
                onClick={() => {
                  setMenuShown(false);

                  dispatch(mapsSetAllOffline(true));
                }}
              >
                <BiWifiOff />
                <MenuLabel>
                  <Text m={mm} k="makeAllOffline" />
                </MenuLabel>
              </OnlineOnlyItem>

              <Dropdown.Item
                as="button"
                disabled={offlineIds.length === 0}
                onClick={() => {
                  setMenuShown(false);

                  dispatch(mapsSetAllOffline(false));
                }}
              >
                <FaTimes />
                <MenuLabel>
                  <Text m={mm} k="removeAllOffline" />
                </MenuLabel>
              </Dropdown.Item>

              <Dropdown.Item
                as="button"
                // A blocked save is waiting for a decision, not for a push, so
                // it doesn't count towards there being anything to send.
                disabled={!outbox.some((entry) => !entry.blocked)}
                onClick={() => {
                  setMenuShown(false);

                  dispatch(mapsSyncOutbox({ manual: true }));
                }}
              >
                <FaCloudUploadAlt />
                <MenuLabel>
                  <Text m={mm} k="syncNow" />
                </MenuLabel>
              </Dropdown.Item>
            </FmDropdownMenu>
          </Dropdown>
        </div>

        {(hasShared || ownerFilter !== 'all') && (
          <ToggleButtonGroup
            type="radio"
            name="myMapsOwner"
            size="sm"
            className="mb-3"
            value={ownerFilter}
            onChange={(value: MyMapsOwnerFilter) => {
              trackMatomo(['trackEvent', 'MyMaps', 'ownerFilter', value]);

              dispatch(mapsSetOwnerFilter(value));
            }}
          >
            {(
              [
                ['all', mm?.ownerAll],
                ['own', mm?.ownerOwn],
                ['shared', mm?.ownerShared],
                ['sharedByMe', mm?.ownerSharedByMe],
              ] as const
            ).map(([value, label]) => (
              <ToggleButton
                key={value}
                id={`myMapsOwner-${value}`}
                value={value}
                variant="outline-primary"
              >
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}

        {shownTags.length > 0 && (
          <div className="d-flex align-items-start gap-2 mb-3">
            <div className="d-flex flex-wrap gap-1 flex-grow-1">
              {[...shownTags, ...(allMode ? [] : [UNTAGGED])].map((tag, i) => (
                <ToggleButton
                  key={tag}
                  id={`myMapsTag-${i}`}
                  type="checkbox"
                  size="sm"
                  variant="outline-primary"
                  value={tag}
                  checked={picked.includes(tag)}
                  onChange={() => togglePick(tag)}
                  // Its two clicks have toggled it back already.
                  onDoubleClick={() =>
                    onTagPickChange({
                      ...tagPick,
                      tags:
                        picked.length === 1 && picked[0] === tag ? [] : [tag],
                    })
                  }
                >
                  {tag || <i>{mm?.untagged}</i>}
                </ToggleButton>
              ))}

              {picked.length > 0 && (
                <LongPressTooltip label={m?.general.clear}>
                  {({ props }) => (
                    <Button
                      size="sm"
                      variant="link"
                      className="text-body px-1"
                      onClick={() => onTagPickChange({ ...tagPick, tags: [] })}
                      {...props}
                    >
                      <FaTimes />
                    </Button>
                  )}
                </LongPressTooltip>
              )}
            </div>

            {pickedTags.length > 1 && (
              <FitToggleButtonGroup
                type="radio"
                name="myMapsTagMode"
                size="sm"
                className="flex-shrink-0"
                value={tagPick.mode}
                onChange={(mode: TagPick['mode']) =>
                  onTagPickChange({ ...tagPick, mode })
                }
              >
                <ToggleButton
                  id="myMapsTagMode-any"
                  value="any"
                  variant="outline-primary"
                >
                  <Text m={mm} k="tagModeAny" />
                </ToggleButton>

                <ToggleButton
                  id="myMapsTagMode-all"
                  value="all"
                  variant="outline-primary"
                >
                  <Text m={mm} k="tagModeAll" />
                </ToggleButton>
              </FitToggleButtonGroup>
            )}
          </div>
        )}

        {filteredMaps.length === 0 && orphans.length === 0 ? (
          <p className="text-muted mb-0">
            <Text m={mm} k="noMapFound" />
          </p>
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
                      {!isOwn && (
                        <Badge bg="success" className="ms-1">
                          <FaUserFriends />{' '}
                          <Text m={mm} k="sharedWithMeBadge" />
                        </Badge>
                      )}
                      {isSharedByMe(map) && (
                        <LongPressTooltip
                          label={
                            map.editors?.length ? (
                              <>
                                <Text m={mm} k="writers" />:{' '}
                                {map.editors
                                  .map((editor) => editor.name)
                                  .join(', ')}
                              </>
                            ) : undefined
                          }
                        >
                          {({ props }) => (
                            <Badge bg="info" className="ms-1" {...props}>
                              <FaUserFriends /> <Text m={mm} k="sharedBadge" />
                            </Badge>
                          )}
                        </LongPressTooltip>
                      )}
                      {isOffline && (
                        <Badge bg="secondary" className="ms-1">
                          <BiWifiOff /> <Text m={mm} k="offline" />
                        </Badge>
                      )}
                      <MapSyncStatus mapId={map.id} className="ms-1" />
                      {map.tags.map((tag) => (
                        <Badge
                          key={tag}
                          pill
                          bg="secondary-subtle"
                          text="secondary-emphasis"
                          className="ms-1"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <small className="text-muted">
                      {!isOwn && map.owner && (
                        <>
                          <span className="text-nowrap">
                            <Text m={mm} k="owner" />:{' '}
                            <UserChip user={map.owner} />
                          </span>
                          {' · '}
                        </>
                      )}
                      <span className="text-nowrap">
                        <Text k="general.createdAt" />:{' '}
                        <strong>{dateFormat.format(map.createdAt)}</strong>
                      </span>
                      {' · '}
                      <span className="text-nowrap">
                        <Text k="general.modifiedAt" />:{' '}
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
                        requiresOnline={
                          !isOffline &&
                          !(pending && canStandInForMap(pending.blocked))
                        }
                        onClick={() => handleLoad(map.id, true)}
                        menu={
                          <Dropdown.Item
                            as="button"
                            onClick={() => handleLoad(map.id, false)}
                          >
                            <FaShapes />
                            <MenuLabel>
                              <Text m={mm} k="loadExclMapAndPosition" />
                            </MenuLabel>
                          </Dropdown.Item>
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

                      <ActionDivider />

                      {/* Another's map too, for its tags. */}
                      <Action
                        icon={<FaEdit />}
                        label={m?.general.modify}
                        requiresOnline
                        onClick={() => onEdit(map)}
                        showFrom="lg"
                      />

                      {isOwn && (
                        <Action
                          icon={<FaCalendarDay />}
                          label={mm?.newEvent}
                          requiresOnline
                          onClick={() =>
                            dispatch(
                              setActiveModal({
                                type: 'event-form',
                                mapId: map.id,
                              }),
                            )
                          }
                          showFrom="never"
                        />
                      )}

                      {isOwn && (
                        <Action
                          icon={<FaTrash />}
                          label={m?.general.delete}
                          variant="danger"
                          requiresOnline
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

                      {!isOwn && (
                        <Action
                          icon={<FaUserMinus />}
                          label={mm?.leave}
                          variant="danger"
                          requiresOnline
                          onClick={async () => {
                            if (
                              await confirm({
                                title: mm?.leave,
                                message: mm?.leaveConfirm(map.name),
                                confirmLabel: mm?.leave,
                                confirmStyle: 'danger',
                              })
                            ) {
                              dispatch(mapsLeave(map.id));
                            }
                          }}
                          showFrom="never"
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

        {hiddenCount > 0 && (
          <p className="text-muted small mt-2 mb-0">
            <FaEyeSlash /> {mm?.hiddenMaps(hiddenCount)}
          </p>
        )}
      </Modal.Body>

      <FmModalFooter>
        <FmFooterButton
          onClick={onAdd}
          disabled={!online}
          icon={<FaPlus />}
          label={mm?.addNew}
        />

        {/* Beside the button, not in it: a disabled one takes no pointer
            events, so a badge inside could never be asked what it means. */}
        <OfflineBadge />

        <FmDismissButton label={m?.general.close} onClick={close} />
      </FmModalFooter>
    </>
  );
}
